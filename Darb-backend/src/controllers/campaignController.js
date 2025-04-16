// src/controllers/campaignController.js
const db = require('../config/database');
const { formatResponse } = require('../utils/responseFormatter');

// Remove UUID dependency
// const { v4: uuidv4 } = require('uuid');

/**
 * Get most viewed campaigns
 * @route GET /api/campaigns/most-viewed
 * @access Public
 */
const getMostViewedCampaigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    // Get most viewed campaigns using your Campaign model
    const [campaigns] = await db.query(`
      SELECT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      WHERE c.status = 'active'
      ORDER BY c.view_count DESC
      LIMIT ?
    `, [limit]);
    
    // Process campaigns
    const processedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
      // Get main images for each campaign
      const [images] = await db.query(
        'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? LIMIT 1',
        [campaign.id, 'main']
      );
      
      // Calculate days left
      const endDate = new Date(campaign.end_date);
      const now = new Date();
      const diffTime = endDate - now;
      const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        location: campaign.location,
        stage: campaign.stage,
        targetAmount: campaign.target_amount,
        currentAmount: campaign.current_amount,
        status: campaign.status,
        endDate: campaign.end_date,
        createdAt: campaign.created_at,
        viewCount: campaign.view_count || 0,
        daysLeft: daysLeft,
        imageUrl: images.length > 0 ? images[0].image_url : null,
        creator: {
          id: campaign.creator_id,
          name: campaign.creator_name || 'Anonymous',
          avatar: campaign.creator_avatar
        }
      };
    }));

    return formatResponse(res, 200, 'Most viewed campaigns retrieved successfully', { campaigns: processedCampaigns });
  } catch (error) {
    console.error('Error getting most viewed campaigns:', error);
    return formatResponse(res, 500, 'Failed to retrieve most viewed campaigns');
  }
};

/**
 * Track a campaign view and increment view count
 * @route POST /api/campaigns/:id/view
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @access Public
 */
const trackView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    
    // Check if campaign exists
    const campaign = await getCampaignById(id);
    
    if (!campaign) {
      return formatResponse(res, 404, 'Campaign not found');
    }
    
    // Increment view count
    await db.query(
      'UPDATE campaigns SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
    
    // Track view in campaign_views table if it exists
    try {
      await db.query(
        'INSERT INTO campaign_views (campaign_id, user_id, ip_address, created_at) VALUES (?, ?, ?, NOW())',
        [id, userId, req.ip || '0.0.0.0']
      );
    } catch (viewError) {
      console.error('Error tracking view in campaign_views:', viewError);
      // Continue even if this fails, as the view count was already incremented
    }
    
    return formatResponse(res, 200, 'View tracked successfully');
  } catch (error) {
    console.error('Error tracking view:', error);
    return formatResponse(res, 500, 'Failed to track view');
  }
};

/**
 * Create a new campaign
 * @route POST /api/campaigns
 * @access Private
 */
const createCampaign = async (req, res, next) => {
  try {
    const campaignData = req.body;
    
    // Create a new campaign with auto-increment ID
    const [result] = await db.query(`
      INSERT INTO campaigns (
        title, description, category, location, stage,
        target_amount, minimum_investment, current_amount,
        creator_id, status, created_at, updated_at, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `, [
      campaignData.title,
      campaignData.description,
      campaignData.category,
      campaignData.location,
      campaignData.stage || 'concept',
      campaignData.targetAmount || campaignData.financials?.targetAmount || 0,
      campaignData.minimumInvestment || campaignData.financials?.minimumInvestment || 0,
      0, // Initial current_amount is 0
      req.user.id,
      campaignData.status || 'draft',
      campaignData.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Default to 90 days
    ]);
    
    // Get the inserted ID
    const campaignId = result.insertId;
    
    // Save other campaign data (sections, images, etc.)
    await saveCampaignDetails(campaignId, campaignData);
    
    // Get the created campaign
    const campaign = await getCampaignById(campaignId);
    
    return formatResponse(res, 201, 'Campaign created successfully', campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return formatResponse(res, 500, `Failed to create campaign: ${error.message}`);
  }
};

/**
 * Save additional campaign details
 */
const saveCampaignDetails = async (campaignId, campaignData) => {
  const now = new Date();
  
  // Save problem statement
  if (campaignData.problemStatement) {
    await db.query(
      'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [campaignId, 'problem_statement', campaignData.problemStatement.content, now, now]
    );
    
    // Save problem statement images
    if (campaignData.problemStatement.images && campaignData.problemStatement.images.length > 0) {
      for (const image of campaignData.problemStatement.images) {
        await db.query(
          'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
          [campaignId, 'problem_statement', image.url || image.preview, now]
        );
      }
    }
  }
  
  // Save solution
  if (campaignData.solution) {
    await db.query(
      'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [campaignId, 'solution', campaignData.solution.content, now, now]
    );
    
    // Save solution images
    if (campaignData.solution.images && campaignData.solution.images.length > 0) {
      for (const image of campaignData.solution.images) {
        await db.query(
          'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
          [campaignId, 'solution', image.url || image.preview, now]
        );
      }
    }
  }
  
  // Save main campaign images
  if (campaignData.images && campaignData.images.length > 0) {
    for (const image of campaignData.images) {
      await db.query(
        'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
        [campaignId, 'main', image.url || image.preview, now]
      );
    }
  }
  
  // Save pitch asset
  if (campaignData.pitchAsset) {
    await db.query(
      'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
      [campaignId, 'pitch', campaignData.pitchAsset.url || campaignData.pitchAsset.preview, campaignData.pitchAsset.type || 'image', now]
    );
  }
  
  // Save business plan
  if (campaignData.businessPlan) {
    await db.query(
      'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
      [campaignId, 'business_plan', campaignData.businessPlan.url, 'document', now]
    );
  }
  
  // Save milestones
  if (campaignData.financials?.milestones && campaignData.financials.milestones.length > 0) {
    for (const milestone of campaignData.financials.milestones) {
      // Use auto-increment for milestone ID too
      const [milestoneResult] = await db.query(
        `INSERT INTO milestones (
          campaign_id, title, deliverables, amount, target_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          campaignId,
          milestone.title,
          milestone.deliverables,
          milestone.amount,
          milestone.targetDate,
          now,
          now
        ]
      );
      
      const milestoneId = milestoneResult.insertId;
      
      // Save milestone image if exists
      if (milestone.image) {
        await db.query(
          'INSERT INTO campaign_images (campaign_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'milestone', milestoneId, milestone.image.url || milestone.image.preview, now]
        );
      }
    }
  }
  
  // Save team members
  if (campaignData.team && campaignData.team.length > 0) {
    for (const member of campaignData.team) {
      // Use auto-increment for team member ID too
      const [memberResult] = await db.query(
        `INSERT INTO team_members (
          campaign_id, name, role, bio, email, linkedin, twitter, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          campaignId,
          member.name,
          member.role,
          member.bio,
          member.email || null,
          member.linkedIn || null,
          member.twitter || null,
          now,
          now
        ]
      );
      
      const memberId = memberResult.insertId;
      
      // Save team member image if exists
      if (member.image) {
        await db.query(
          'INSERT INTO campaign_images (campaign_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'team_member', memberId, member.image.url || member.image.preview, now]
        );
      }
    }
  }
  
  // Save risks
  if (campaignData.risks?.items && campaignData.risks.items.length > 0) {
    for (const risk of campaignData.risks.items) {
      await db.query(
        `INSERT INTO risks (
          campaign_id, category, description, mitigation, impact, likelihood, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          campaignId,
          risk.category,
          risk.description,
          risk.mitigation,
          risk.impact,
          risk.likelihood,
          now,
          now
        ]
      );
    }
  }
};

/**
 * Get all campaigns
 * @route GET /api/campaigns
 * @access Public
 */
const getCampaigns = async (req, res, next) => {
  try {
    const { category, status, limit = 10, offset = 0 } = req.query;
    
    let query = `
      SELECT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters
    if (category) {
      query += ' AND c.category = ?';
      queryParams.push(category);
    }
    
    if (status) {
      query += ' AND c.status = ?';
      queryParams.push(status);
    } else {
      // By default, only show active campaigns
      query += ' AND c.status = "active"';
    }
    
    // Add sorting
    query += ' ORDER BY c.created_at DESC';
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [campaigns] = await db.query(query, queryParams);
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM campaigns c WHERE 1=1 ${
        category ? ' AND c.category = ?' : ''
      } ${status ? ' AND c.status = ?' : ' AND c.status = "active"'}`,
      queryParams.slice(0, queryParams.length - 2)
    );
    
    const total = countResult[0].total;
    
    // Get images for each campaign
    const campaignsWithImages = await Promise.all(
      campaigns.map(async (campaign) => {
        const [images] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = "main" LIMIT 1',
          [campaign.id]
        );
        
        return {
          ...campaign,
          imageUrl: images.length > 0 ? images[0].image_url : null
        };
      })
    );
    
    return formatResponse(res, 200, 'Campaigns retrieved successfully', {
      campaigns: campaignsWithImages,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return formatResponse(res, 500, `Failed to get campaigns: ${error.message}`);
  }
};

/**
 * Get a campaign by ID
 * @route GET /api/campaigns/:id
 * @access Public
 */
const getCampaignById = async (id) => {
  try {
    // Get basic campaign information
    const [campaigns] = await db.query(`
      SELECT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar
      FROM campaigns c
      LEFT JOIN users u ON c.creator_id = u.id
      WHERE c.id = ?
    `, [id]);
    
    if (campaigns.length === 0) {
      return null;
    }
    
    const campaign = campaigns[0];
    
    // Get campaign sections (problem statement, solution)
    const [sections] = await db.query(
      'SELECT * FROM campaign_sections WHERE campaign_id = ?',
      [id]
    );
    
    // Process sections
    campaign.problemStatement = { content: '' };
    campaign.solution = { content: '' };
    
    for (const section of sections) {
      if (section.section_type === 'problem_statement') {
        campaign.problemStatement.content = section.content;
      } else if (section.section_type === 'solution') {
        campaign.solution.content = section.content;
      }
    }
    
    // Get campaign images
    const [images] = await db.query(
      'SELECT * FROM campaign_images WHERE campaign_id = ?',
      [id]
    );
    
    // Process main images
    campaign.images = images
      .filter(img => img.section_type === 'main')
      .map(img => ({ url: img.image_url, preview: img.image_url }));
    
    // Process problem statement images
    campaign.problemStatement.images = images
      .filter(img => img.section_type === 'problem_statement')
      .map(img => ({ url: img.image_url, preview: img.image_url }));
    
    // Process solution images
    campaign.solution.images = images
      .filter(img => img.section_type === 'solution')
      .map(img => ({ url: img.image_url, preview: img.image_url }));
    
    // Get campaign assets (pitch asset, business plan)
    const [assets] = await db.query(
      'SELECT * FROM campaign_assets WHERE campaign_id = ?',
      [id]
    );
    
    // Process assets
    for (const asset of assets) {
      if (asset.asset_type === 'pitch') {
        campaign.pitchAsset = {
          type: asset.media_type,
          url: asset.asset_url,
          preview: asset.asset_url
        };
      } else if (asset.asset_type === 'business_plan') {
        campaign.businessPlan = {
          url: asset.asset_url,
          name: 'Business Plan'
        };
      }
    }
    
    // Get milestones
    const [milestones] = await db.query(
      'SELECT * FROM milestones WHERE campaign_id = ? ORDER BY target_date ASC',
      [id]
    );
    
    // Process milestones
    campaign.financials = {
      targetAmount: campaign.target_amount,
      minimumInvestment: campaign.minimum_investment,
      milestones: await Promise.all(milestones.map(async (milestone) => {
        // Get milestone image
        const [milestoneImages] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? AND related_id = ?',
          [id, 'milestone', milestone.id]
        );
        
        const milestoneImage = milestoneImages.length > 0 
          ? { url: milestoneImages[0].image_url, preview: milestoneImages[0].image_url } 
          : null;
        
        return {
          id: milestone.id,
          title: milestone.title,
          deliverables: milestone.deliverables,
          amount: milestone.amount,
          targetDate: milestone.target_date,
          image: milestoneImage
        };
      }))
    };
    
    // Get team members
    const [teamMembers] = await db.query(
      'SELECT * FROM team_members WHERE campaign_id = ?',
      [id]
    );
    
    // Process team members
    campaign.team = await Promise.all(teamMembers.map(async (member) => {
      // Get team member image
      const [memberImages] = await db.query(
        'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? AND related_id = ?',
        [id, 'team_member', member.id]
      );
      
      const memberImage = memberImages.length > 0 
        ? { url: memberImages[0].image_url, preview: memberImages[0].image_url } 
        : null;
      
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        bio: member.bio,
        email: member.email,
        linkedIn: member.linkedin,
        twitter: member.twitter,
        image: memberImage
      };
    }));
    
    // Get risks
    const [risks] = await db.query(
      'SELECT * FROM risks WHERE campaign_id = ?',
      [id]
    );
    
    // Process risks
    campaign.risks = {
      items: risks.map(risk => ({
        id: risk.id,
        category: risk.category,
        description: risk.description,
        mitigation: risk.mitigation,
        impact: risk.impact,
        likelihood: risk.likelihood
      }))
    };
    
    // Format dates and other properties
    campaign.createdAt = campaign.created_at;
    campaign.updatedAt = campaign.updated_at;
    campaign.endDate = campaign.end_date;
    
    delete campaign.created_at;
    delete campaign.updated_at;
    delete campaign.end_date;
    
    // Convert snake_case to camelCase for remaining fields
    campaign.targetAmount = campaign.target_amount;
    campaign.minimumInvestment = campaign.minimum_investment;
    campaign.currentAmount = campaign.current_amount;
    
    delete campaign.target_amount;
    delete campaign.minimum_investment;
    delete campaign.current_amount;
    
    // Add creator info
    campaign.creator = {
      id: campaign.creator_id,
      name: campaign.creator_name || 'Anonymous',
      avatar: campaign.creator_avatar
    };
    
    delete campaign.creator_id;
    delete campaign.creator_name;
    delete campaign.creator_avatar;
    
    return campaign;
  } catch (error) {
    console.error('Error getting campaign by ID:', error);
    throw error;
  }
};

/**
 * Get campaign by ID
 * @route GET /api/campaigns/:id
 * @access Public
 */
const getCampaign = async (req, res, next) => {
  try {
    const campaign = await getCampaignById(req.params.id);
    
    if (!campaign) {
      return formatResponse(res, 404, 'Campaign not found');
    }
    
    return formatResponse(res, 200, 'Campaign retrieved successfully', campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    return formatResponse(res, 500, `Failed to get campaign: ${error.message}`);
  }
};

/**
 * Get user's campaigns
 * @route GET /api/campaigns/user/my-campaigns
 * @access Private
 */
const getMyCampaigns = async (req, res, next) => {
  try {
    const [campaigns] = await db.query(
      `SELECT * FROM campaigns WHERE creator_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    // Get images for each campaign
    const campaignsWithImages = await Promise.all(
      campaigns.map(async (campaign) => {
        const [images] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = "main" LIMIT 1',
          [campaign.id]
        );
        
        return {
          ...campaign,
          imageUrl: images.length > 0 ? images[0].image_url : null
        };
      })
    );
    
    return formatResponse(res, 200, 'User campaigns retrieved successfully', campaignsWithImages);
  } catch (error) {
    console.error('Error getting user campaigns:', error);
    return formatResponse(res, 500, `Failed to get user campaigns: ${error.message}`);
  }
};

/**
 * Update a campaign
 * @route PUT /api/campaigns/:id
 * @access Private
 */
const updateCampaign = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    const campaignData = req.body;
    
    // Check if campaign exists and belongs to user
    const [campaigns] = await db.query(
      'SELECT * FROM campaigns WHERE id = ? AND creator_id = ?',
      [campaignId, req.user.id]
    );
    
    if (campaigns.length === 0) {
      return formatResponse(res, 404, 'Campaign not found or unauthorized');
    }
    
    // Update basic campaign information
    await db.query(`
      UPDATE campaigns SET
        title = ?,
        description = ?,
        category = ?,
        location = ?,
        stage = ?,
        target_amount = ?,
        minimum_investment = ?,
        status = ?,
        updated_at = NOW(),
        end_date = ?
      WHERE id = ?
    `, [
      campaignData.title,
      campaignData.description,
      campaignData.category,
      campaignData.location,
      campaignData.stage || 'concept',
      campaignData.targetAmount || campaignData.financials?.targetAmount,
      campaignData.minimumInvestment || campaignData.financials?.minimumInvestment,
      campaignData.status || 'draft',
      campaignData.endDate || campaignData.projectDuration?.endDate,
      campaignId
    ]);
    
    // Update related campaign data
    // This would involve more complex logic to update or delete existing records
    // For simplicity, we'll just get the updated campaign
    
    const updatedCampaign = await getCampaignById(campaignId);
    return formatResponse(res, 200, 'Campaign updated successfully', updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return formatResponse(res, 500, `Failed to update campaign: ${error.message}`);
  }
};

/**
 * Delete a campaign
 * @route DELETE /api/campaigns/:id
 * @access Private
 */
const deleteCampaign = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    
    // Check if campaign exists and belongs to user
    const [campaigns] = await db.query(
      'SELECT * FROM campaigns WHERE id = ? AND creator_id = ?',
      [campaignId, req.user.id]
    );
    
    if (campaigns.length === 0) {
      return formatResponse(res, 404, 'Campaign not found or unauthorized');
    }
    
    // Delete the campaign
    await db.query('DELETE FROM campaigns WHERE id = ?', [campaignId]);
    
    return formatResponse(res, 200, 'Campaign deleted successfully');
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return formatResponse(res, 500, `Failed to delete campaign: ${error.message}`);
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getMyCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getMostViewedCampaigns,
  trackView
};