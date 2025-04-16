// src/models/campaignModel.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Campaign model handles all database operations related to campaigns
 */
class Campaign {
  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data
   * @param {string} userId - Creator's user ID
   * @returns {Promise<Object>} - The created campaign
   */

  /**
 * Increment the view count for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<boolean>} - Success status
 */
static async incrementViewCount(campaignId) {
  try {
    await db.query(
      'UPDATE campaigns SET view_count = view_count + 1 WHERE id = ?',
      [campaignId]
    );
    return true;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return false;
  }
}

/**
 * Get most viewed campaigns
 * @param {number} limit - Maximum number of campaigns to return
 * @returns {Promise<Array>} - Most viewed campaigns
 */
static async getMostViewed(limit = 3) {
  try {
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
        viewCount: campaign.view_count,
        daysLeft: daysLeft,
        imageUrl: images.length > 0 ? images[0].image_url : null,
        creator: {
          id: campaign.creator_id,
          name: campaign.creator_name || 'Anonymous',
          avatar: campaign.creator_avatar
        }
      };
    }));
    
    return processedCampaigns;
  } catch (error) {
    console.error('Error getting most viewed campaigns:', error);
    throw error;
  }
}
  /**
   * Track a campaign view
   * @param {string} campaignId - Campaign ID
   * @param {string} userId - User ID (optional for anonymous users)
   * @param {string} sessionId - Session ID (for anonymous users)
   * @returns {Promise<void>}
   */
  static async trackView(campaignId, userId, sessionId = 'anonymous-session') {
    try {
      const now = new Date();
      
      // Check if campaign exists
      const [campaign] = await db.query('SELECT id FROM campaigns WHERE id = ?', [campaignId]);
      
      if (campaign.length === 0) {
        throw new Error('Campaign not found');
      }

      let shouldIncrementViewCount = false;
      
      if (userId) {
        // For authenticated users
        // Check if this user has already viewed this campaign recently (within a day)
        const [existingView] = await db.query(
          `SELECT id, TIMESTAMPDIFF(HOUR, viewed_at, NOW()) as hours_since 
           FROM campaign_views 
           WHERE campaign_id = ? AND user_id = ? 
           ORDER BY viewed_at DESC LIMIT 1`,
          [campaignId, userId]
        );
        
        if (existingView.length > 0) {
          // Only count as a new view if last view was more than 24 hours ago
          if (existingView[0].hours_since >= 24) {
            shouldIncrementViewCount = true;
          }
          
          // Update existing view timestamp
          await db.query(
            'UPDATE campaign_views SET viewed_at = ? WHERE id = ?',
            [now, existingView[0].id]
          );
        } else {
          // Insert new view
          await db.query(
            'INSERT INTO campaign_views (campaign_id, user_id, viewed_at) VALUES (?, ?, ?)',
            [campaignId, userId, now]
          );
          shouldIncrementViewCount = true;
        }
      } else {
        // For anonymous users (using sessionId)
        // Check if this session has already viewed this campaign recently
        const [existingView] = await db.query(
          `SELECT id, TIMESTAMPDIFF(HOUR, viewed_at, NOW()) as hours_since 
           FROM campaign_views 
           WHERE campaign_id = ? AND session_id = ? 
           ORDER BY viewed_at DESC LIMIT 1`,
          [campaignId, sessionId]
        );
        
        if (existingView.length > 0) {
          // Only count as a new view if last view was more than 6 hours ago
          if (existingView[0].hours_since >= 6) {
            shouldIncrementViewCount = true;
          }
          
          // Update existing view timestamp
          await db.query(
            'UPDATE campaign_views SET viewed_at = ? WHERE id = ?',
            [now, existingView[0].id]
          );
        } else {
          // Insert new view
          await db.query(
            'INSERT INTO campaign_views (campaign_id, session_id, viewed_at) VALUES (?, ?, ?)',
            [campaignId, sessionId, now]
          );
          shouldIncrementViewCount = true;
        }
      }
      
      // Only increment view count if it's a "new" view (not a repeat view)
      if (shouldIncrementViewCount) {
        await db.query(
          'UPDATE campaigns SET view_count = view_count + 1 WHERE id = ?',
          [campaignId]
        );
      }
    } catch (error) {
      console.error('Error tracking campaign view:', error);
      throw error;
    }
  }
  static async create(campaignData, userId) {
    try {
      const campaignId = uuidv4();
      const now = new Date();
      
      // Basic campaign information
      const query = `
        INSERT INTO campaigns (
          id, title, description, category, location, stage,
          target_amount, minimum_investment, current_amount,
          creator_id, status, created_at, updated_at, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(query, [
        campaignId,
        campaignData.title,
        campaignData.description,
        campaignData.category,
        campaignData.location,
        campaignData.stage || 'concept',
        campaignData.financials?.targetAmount || campaignData.targetAmount,
        campaignData.financials?.minimumInvestment || 0,
        0, // Initial current_amount is 0
        userId,
        campaignData.status || 'draft',
        now,
        now,
        campaignData.projectDuration?.endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // Default to 90 days
      ]);

      // Process problem statement
      if (campaignData.problemStatement) {
        await db.query(
          'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'problem_statement', campaignData.problemStatement.content, now, now]
        );
        
        // Process problem statement images
        if (campaignData.problemStatement.images && campaignData.problemStatement.images.length > 0) {
          for (const image of campaignData.problemStatement.images) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [campaignId, 'problem_statement', image.url || image.preview, now]
            );
          }
        }
      }

      // Process solution
      if (campaignData.solution) {
        await db.query(
          'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'solution', campaignData.solution.content, now, now]
        );
        
        // Process solution images
        if (campaignData.solution.images && campaignData.solution.images.length > 0) {
          for (const image of campaignData.solution.images) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [campaignId, 'solution', image.url || image.preview, now]
            );
          }
        }
      }

      // Process main campaign images
      if (campaignData.images && campaignData.images.length > 0) {
        for (const image of campaignData.images) {
          await db.query(
            'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
            [campaignId, 'main', image.url || image.preview, now]
          );
        }
      }

      // Process pitch asset
      if (campaignData.pitchAsset) {
        await db.query(
          'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'pitch', campaignData.pitchAsset.url || campaignData.pitchAsset.preview, campaignData.pitchAsset.type || 'image', now]
        );
      }

      // Process business plan
      if (campaignData.businessPlan) {
        await db.query(
          'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'business_plan', campaignData.businessPlan.url, 'document', now]
        );
      }

      // Process milestones
      if (campaignData.financials?.milestones && campaignData.financials.milestones.length > 0) {
        for (const milestone of campaignData.financials.milestones) {
          const milestoneId = uuidv4();
          
          await db.query(
            `INSERT INTO milestones (
              id, campaign_id, title, deliverables, amount, target_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              milestoneId,
              campaignId,
              milestone.title,
              milestone.deliverables,
              milestone.amount,
              milestone.targetDate,
              now,
              now
            ]
          );

          // Process milestone image if exists
          if (milestone.image) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
              [campaignId, 'milestone', milestoneId, milestone.image.url || milestone.image.preview, now]
            );
          }
        }
      }

      // Process team members
      if (campaignData.team && campaignData.team.length > 0) {
        for (const member of campaignData.team) {
          const memberId = uuidv4();
          
          await db.query(
            `INSERT INTO team_members (
              id, campaign_id, name, role, bio, email, linkedin, twitter, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              memberId,
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

          // Process team member image if exists
          if (member.image) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
              [campaignId, 'team_member', memberId, member.image.url || member.image.preview, now]
            );
          }
        }
      }

      // Process risks
      if (campaignData.risks?.items && campaignData.risks.items.length > 0) {
        for (const risk of campaignData.risks.items) {
          await db.query(
            `INSERT INTO risks (
              id, campaign_id, category, description, mitigation, impact, likelihood, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(),
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

      // Return the created campaign
      return await this.getById(campaignId);
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Update an existing campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise<Object>} - The updated campaign
   */
  static async update(campaignId, campaignData) {
    try {
      const now = new Date();
      
      // Update basic campaign information
      const query = `
        UPDATE campaigns SET
          title = ?,
          description = ?,
          category = ?,
          location = ?,
          stage = ?,
          target_amount = ?,
          minimum_investment = ?,
          status = ?,
          updated_at = ?,
          end_date = ?
        WHERE id = ?
      `;

      await db.query(query, [
        campaignData.title,
        campaignData.description,
        campaignData.category,
        campaignData.location,
        campaignData.stage || 'concept',
        campaignData.financials?.targetAmount || campaignData.targetAmount,
        campaignData.financials?.minimumInvestment || 0,
        campaignData.status || 'draft',
        now,
        campaignData.projectDuration?.endDate || campaignData.endDate,
        campaignId
      ]);

      // Update problem statement
      if (campaignData.problemStatement) {
        // Check if problem statement exists
        const [existingProblemStatement] = await db.query(
          'SELECT id FROM campaign_sections WHERE campaign_id = ? AND section_type = ?',
          [campaignId, 'problem_statement']
        );

        if (existingProblemStatement.length > 0) {
          await db.query(
            'UPDATE campaign_sections SET content = ?, updated_at = ? WHERE campaign_id = ? AND section_type = ?',
            [campaignData.problemStatement.content, now, campaignId, 'problem_statement']
          );
        } else {
          await db.query(
            'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [campaignId, 'problem_statement', campaignData.problemStatement.content, now, now]
          );
        }
        
        // Handle problem statement images
        if (campaignData.problemStatement.images && campaignData.problemStatement.images.length > 0) {
          // Remove existing images
          await db.query(
            'DELETE FROM campaign_images WHERE campaign_id = ? AND section_type = ?',
            [campaignId, 'problem_statement']
          );
          
          // Add new images
          for (const image of campaignData.problemStatement.images) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [campaignId, 'problem_statement', image.url || image.preview, now]
            );
          }
        }
      }

      // Update solution (similar approach to problem statement)
      if (campaignData.solution) {
        const [existingSolution] = await db.query(
          'SELECT id FROM campaign_sections WHERE campaign_id = ? AND section_type = ?',
          [campaignId, 'solution']
        );

        if (existingSolution.length > 0) {
          await db.query(
            'UPDATE campaign_sections SET content = ?, updated_at = ? WHERE campaign_id = ? AND section_type = ?',
            [campaignData.solution.content, now, campaignId, 'solution']
          );
        } else {
          await db.query(
            'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [campaignId, 'solution', campaignData.solution.content, now, now]
          );
        }
        
        // Handle solution images
        if (campaignData.solution.images && campaignData.solution.images.length > 0) {
          await db.query(
            'DELETE FROM campaign_images WHERE campaign_id = ? AND section_type = ?',
            [campaignId, 'solution']
          );
          
          for (const image of campaignData.solution.images) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [campaignId, 'solution', image.url || image.preview, now]
            );
          }
        }
      }

      // Update main campaign images
      if (campaignData.images && campaignData.images.length > 0) {
        await db.query(
          'DELETE FROM campaign_images WHERE campaign_id = ? AND section_type = ?',
          [campaignId, 'main']
        );
        
        for (const image of campaignData.images) {
          await db.query(
            'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
            [campaignId, 'main', image.url || image.preview, now]
          );
        }
      }

      // Update pitch asset
      if (campaignData.pitchAsset) {
        const [existingPitchAsset] = await db.query(
          'SELECT id FROM campaign_assets WHERE campaign_id = ? AND asset_type = ?',
          [campaignId, 'pitch']
        );

        if (existingPitchAsset.length > 0) {
          await db.query(
            'UPDATE campaign_assets SET asset_url = ?, media_type = ?, updated_at = ? WHERE campaign_id = ? AND asset_type = ?',
            [campaignData.pitchAsset.url || campaignData.pitchAsset.preview, campaignData.pitchAsset.type || 'image', now, campaignId, 'pitch']
          );
        } else {
          await db.query(
            'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
            [campaignId, 'pitch', campaignData.pitchAsset.url || campaignData.pitchAsset.preview, campaignData.pitchAsset.type || 'image', now]
          );
        }
      }

      // Update business plan
      if (campaignData.businessPlan) {
        const [existingBusinessPlan] = await db.query(
          'SELECT id FROM campaign_assets WHERE campaign_id = ? AND asset_type = ?',
          [campaignId, 'business_plan']
        );

        if (existingBusinessPlan.length > 0) {
          await db.query(
            'UPDATE campaign_assets SET asset_url = ?, updated_at = ? WHERE campaign_id = ? AND asset_type = ?',
            [campaignData.businessPlan.url, now, campaignId, 'business_plan']
          );
        } else {
          await db.query(
            'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
            [campaignId, 'business_plan', campaignData.businessPlan.url, 'document', now]
          );
        }
      }

      // Update milestones
      if (campaignData.financials?.milestones) {
        // Get existing milestones
        const [existingMilestones] = await db.query(
          'SELECT id FROM milestones WHERE campaign_id = ?',
          [campaignId]
        );
        
        // Create a map for existing milestone IDs
        const existingMilestoneIds = new Set(existingMilestones.map(m => m.id));
        
        // Process each milestone
        for (const milestone of campaignData.financials.milestones) {
          if (milestone.id && existingMilestoneIds.has(milestone.id)) {
            // Update existing milestone
            await db.query(
              `UPDATE milestones SET
                title = ?,
                deliverables = ?,
                amount = ?,
                target_date = ?,
                updated_at = ?
              WHERE id = ? AND campaign_id = ?`,
              [
                milestone.title,
                milestone.deliverables,
                milestone.amount,
                milestone.targetDate,
                now,
                milestone.id,
                campaignId
              ]
            );
            
            // Update milestone image if exists
            if (milestone.image) {
              const [existingImage] = await db.query(
                'SELECT id FROM campaign_images WHERE campaign_id = ? AND section_type = ? AND related_id = ?',
                [campaignId, 'milestone', milestone.id]
              );
              
              if (existingImage.length > 0) {
                await db.query(
                  'UPDATE campaign_images SET image_url = ? WHERE id = ?',
                  [milestone.image.url || milestone.image.preview, existingImage[0].id]
                );
              } else {
                await db.query(
                  'INSERT INTO campaign_images (campaign_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
                  [campaignId, 'milestone', milestone.id, milestone.image.url || milestone.image.preview, now]
                );
              }
            }
            
            // Remove from the set to track which ones need to be deleted
            existingMilestoneIds.delete(milestone.id);
          } else {
            // Create new milestone
            const milestoneId = milestone.id || uuidv4();
            
            await db.query(
              `INSERT INTO milestones (
                id, campaign_id, title, deliverables, amount, target_date, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                milestoneId,
                campaignId,
                milestone.title,
                milestone.deliverables,
                milestone.amount,
                milestone.targetDate,
                now,
                now
              ]
            );
            
            // Add milestone image if exists
            if (milestone.image) {
              await db.query(
                'INSERT INTO campaign_images (campaign_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
                [campaignId, 'milestone', milestoneId, milestone.image.url || milestone.image.preview, now]
              );
            }
          }
        }
        
        // Delete milestones that were not included in the update
        for (const milestoneId of existingMilestoneIds) {
          await db.query('DELETE FROM milestones WHERE id = ?', [milestoneId]);
          await db.query(
            'DELETE FROM campaign_images WHERE campaign_id = ? AND section_type = ? AND related_id = ?',
            [campaignId, 'milestone', milestoneId]
          );
        }
      }

      // Similar update logic for team members and risks...
      // (Omitted for brevity but would follow the same pattern as milestones)

      // Return the updated campaign
      return await this.getById(campaignId);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  /**
   * Get a campaign by ID with all related data
   * @param {string} id - Campaign ID
   * @returns {Promise<Object>} - The campaign with all related data
   */
  static async getById(id) {
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
      for (const section of sections) {
        if (section.section_type === 'problem_statement') {
          campaign.problemStatement = { content: section.content };
        } else if (section.section_type === 'solution') {
          campaign.solution = { content: section.content };
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
      if (campaign.problemStatement) {
        campaign.problemStatement.images = images
          .filter(img => img.section_type === 'problem_statement')
          .map(img => ({ url: img.image_url, preview: img.image_url }));
      }
      
      // Process solution images
      if (campaign.solution) {
        campaign.solution.images = images
          .filter(img => img.section_type === 'solution')
          .map(img => ({ url: img.image_url, preview: img.image_url }));
      }
      
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
      
      // Get campaign stats
      const [stats] = await db.query(`
        SELECT 
          COALESCE(COUNT(DISTINCT c.investor_id), 0) as total_contributors
        FROM contributions c
        WHERE c.campaign_id = ?
      `, [id]);
      
      // Process creator
      campaign.creator = {
        id: campaign.creator_id,
        name: campaign.creator_name || 'Anonymous',
        avatar: campaign.creator_avatar || null,
        totalCampaigns: 1, // This would be calculated in a real implementation
        successRate: 100 // This would be calculated in a real implementation
      };
      
      // Clean up campaign object
      delete campaign.creator_id;
      delete campaign.creator_name;
      delete campaign.creator_avatar;
      
      // Format dates
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
      
      return campaign;
    } catch (error) {
      console.error('Error getting campaign by ID:', error);
      throw error;
    }
  }

  /**
   * Delete a campaign
   * @param {string} id - Campaign ID
   * @returns {Promise<boolean>} - True if successful
   */
  static async delete(id) {
    try {
      // Start a transaction
      await db.query('START TRANSACTION');
      
      // Delete all related records first
      await db.query('DELETE FROM campaign_images WHERE campaign_id = ?', [id]);
      await db.query('DELETE FROM campaign_assets WHERE campaign_id = ?', [id]);
      await db.query('DELETE FROM campaign_sections WHERE campaign_id = ?', [id]);
      await db.query('DELETE FROM milestones WHERE campaign_id = ?', [id]);
      await db.query('DELETE FROM team_members WHERE campaign_id = ?', [id]);
      await db.query('DELETE FROM risks WHERE campaign_id = ?', [id]);
      
      // Delete the campaign itself
      await db.query('DELETE FROM campaigns WHERE id = ?', [id]);
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return true;
    } catch (error) {
      // Rollback the transaction in case of error
      await db.query('ROLLBACK');
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaigns with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page
   * @returns {Promise<Object>} - Campaigns and total count
   */
  static async getCampaigns(filters = {}, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit;
      
      // Build the query
      let query = `
        SELECT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar
        FROM campaigns c
        LEFT JOIN users u ON c.creator_id = u.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Add filters
      if (filters.category) {
        query += ' AND c.category = ?';
        queryParams.push(filters.category);
      }
      
      if (filters.stage) {
        query += ' AND c.stage = ?';
        queryParams.push(filters.stage);
      }
      
      if (filters.creatorId) {
        query += ' AND c.creator_id = ?';
        queryParams.push(filters.creatorId);
      }
      
      if (filters.status) {
        query += ' AND c.status = ?';
        queryParams.push(filters.status);
      }
      
      // Only show active campaigns by default
      if (!filters.status && !filters.includeAll) {
        query += ' AND c.status = ?';
        queryParams.push('active');
      }
      
      // Add search term
      if (filters.search) {
        query += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Add sorting
      switch (filters.sortBy) {
        case 'newest':
          query += ' ORDER BY c.created_at DESC';
          break;
        case 'most_funded':
          query += ' ORDER BY c.current_amount DESC';
          break;
        case 'end_date':
          query += ' ORDER BY c.end_date ASC';
          break;
        default:
          query += ' ORDER BY c.created_at DESC';
      }
      
      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      // Execute the query
      const [campaigns] = await db.query(query, queryParams);
      
      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM campaigns c
        WHERE 1=1
      `;
      
      // Add filters to count query (same as above but without sorting and pagination)
      const countQueryParams = [...queryParams.slice(0, -2)];
      
      const [totalCountResult] = await db.query(countQuery, countQueryParams);
      const totalCount = totalCountResult[0].total;
      
      // Process campaigns
      const processedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
        // Get main images for each campaign
        const [images] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? LIMIT 1',
          [campaign.id, 'main']
        );
        
        // Format the campaign object
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
          imageUrl: images.length > 0 ? images[0].image_url : null,
          creator: {
            id: campaign.creator_id,
            name: campaign.creator_name || 'Anonymous',
            avatar: campaign.creator_avatar,
            totalCampaigns: 1, // This would be calculated in a real implementation
            successRate: 100 // This would be calculated in a real implementation
          },
          // Calculate days left
          daysLeft: Math.max(0, Math.floor((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        };
      }));
      
      return {
        data: processedCampaigns,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaigns viewed by a user
   * @param {string} userId - User ID (optional for anonymous users)
   * @param {number} limit - Maximum number of campaigns to return
   * @returns {Promise<Array>} - Recently viewed campaigns
   */
  static async getViewedCampaigns(userId, limit = 10) {
    try {
      let query;
      let queryParams;
      
      if (userId) {
        // Get campaigns viewed by a logged-in user
        query = `
          SELECT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar,
                 cv.viewed_at
          FROM campaign_views cv
          JOIN campaigns c ON cv.campaign_id = c.id
          LEFT JOIN users u ON c.creator_id = u.id
          WHERE cv.user_id = ?
          ORDER BY cv.viewed_at DESC
          LIMIT ?
        `;
        queryParams = [userId, limit];
      } else {
        // For anonymous users, we'll use session-based views
        // This is a simplified version - in reality, you might store this in cookies or session storage
        query = `
          SELECT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar,
                 cv.viewed_at
          FROM campaign_views cv
          JOIN campaigns c ON cv.campaign_id = c.id
          LEFT JOIN users u ON c.creator_id = u.id
          WHERE cv.session_id = ?
          ORDER BY cv.viewed_at DESC
          LIMIT ?
        `;
        queryParams = ['anonymous-session', limit]; // In a real app, this would be a unique session ID
      }
      
      const [campaigns] = await db.query(query, queryParams);
      
      // Process campaigns similar to getCampaigns method
      const processedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
        // Get main images for each campaign
        const [images] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? LIMIT 1',
          [campaign.id, 'main']
        );
        
        // Format the campaign object
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
          imageUrl: images.length > 0 ? images[0].image_url : null,
          creator: {
            id: campaign.creator_id,
            name: campaign.creator_name || 'Anonymous',
            avatar: campaign.creator_avatar,
            totalCampaigns: 1, // This would be calculated in a real implementation
            successRate: 100 // This would be calculated in a real implementation
          },
          viewedAt: campaign.viewed_at,
          daysLeft: Math.max(0, Math.floor((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        };
      }));
      
      return processedCampaigns;
    } catch (error) {
      console.error('Error getting viewed campaigns:', error);
      throw error;
    }
  }

  /**
   * Track a campaign view
   * @param {string} campaignId - Campaign ID
   * @param {string} userId - User ID (optional for anonymous users)
   * @param {string} sessionId - Session ID (for anonymous users)
   * @returns {Promise<void>}
   */
  static async trackView(campaignId, userId, sessionId = 'anonymous-session') {
    try {
      const now = new Date();
      
      // Check if campaign exists
      const [campaign] = await db.query('SELECT id FROM campaigns WHERE id = ?', [campaignId]);
      
      if (campaign.length === 0) {
        throw new Error('Campaign not found');
      }
      
      if (userId) {
        // For authenticated users
        // Check if this user has already viewed this campaign
        const [existingView] = await db.query(
          'SELECT id FROM campaign_views WHERE campaign_id = ? AND user_id = ?',
          [campaignId, userId]
        );
        
        if (existingView.length > 0) {
          // Update existing view timestamp
          await db.query(
            'UPDATE campaign_views SET viewed_at = ? WHERE id = ?',
            [now, existingView[0].id]
          );
        } else {
          // Insert new view
          await db.query(
            'INSERT INTO campaign_views (campaign_id, user_id, viewed_at) VALUES (?, ?, ?)',
            [campaignId, userId, now]
          );
        }
      } else {
        // For anonymous users (using sessionId)
        // Check if this session has already viewed this campaign
        const [existingView] = await db.query(
          'SELECT id FROM campaign_views WHERE campaign_id = ? AND session_id = ?',
          [campaignId, sessionId]
        );
        
        if (existingView.length > 0) {
          // Update existing view timestamp
          await db.query(
            'UPDATE campaign_views SET viewed_at = ? WHERE id = ?',
            [now, existingView[0].id]
          );
        } else {
          // Insert new view
          await db.query(
            'INSERT INTO campaign_views (campaign_id, session_id, viewed_at) VALUES (?, ?, ?)',
            [campaignId, sessionId, now]
          );
        }
      }
      
      // Increment view count on campaign
      await db.query(
        'UPDATE campaigns SET views = views + 1 WHERE id = ?',
        [campaignId]
      );
    } catch (error) {
      console.error('Error tracking campaign view:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for a campaign
   * @param {string} campaignId - Campaign ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - New favorite status
   */
  static async toggleFavorite(campaignId, userId) {
    try {
      // Check if campaign exists
      const [campaign] = await db.query('SELECT id FROM campaigns WHERE id = ?', [campaignId]);
      
      if (campaign.length === 0) {
        throw new Error('Campaign not found');
      }
      
      // Check if already favorited
      const [favorite] = await db.query(
        'SELECT id FROM favorites WHERE campaign_id = ? AND user_id = ?',
        [campaignId, userId]
      );
      
      if (favorite.length > 0) {
        // Remove favorite
        await db.query('DELETE FROM favorites WHERE id = ?', [favorite[0].id]);
        return false; // Not favorited anymore
      } else {
        // Add favorite
        const now = new Date();
        await db.query(
          'INSERT INTO favorites (campaign_id, user_id, created_at) VALUES (?, ?, ?)',
          [campaignId, userId, now]
        );
        return true; // Now favorited
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Get favorite campaigns for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of campaigns to return
   * @returns {Promise<Array>} - Favorite campaigns
   */
  static async getFavoriteCampaigns(userId, limit = 10) {
    try {
      const query = `
        SELECT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar,
               f.created_at as favorited_at
        FROM favorites f
        JOIN campaigns c ON f.campaign_id = c.id
        LEFT JOIN users u ON c.creator_id = u.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        LIMIT ?
      `;
      
      const [campaigns] = await db.query(query, [userId, limit]);
      
      // Process campaigns similar to getViewedCampaigns method
      const processedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
        // Get main images for each campaign
        const [images] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? LIMIT 1',
          [campaign.id, 'main']
        );
        
        // Format the campaign object
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
          imageUrl: images.length > 0 ? images[0].image_url : null,
          creator: {
            id: campaign.creator_id,
            name: campaign.creator_name || 'Anonymous',
            avatar: campaign.creator_avatar,
            totalCampaigns: 1, // This would be calculated in a real implementation
            successRate: 100 // This would be calculated in a real implementation
          },
          favoritedAt: campaign.favorited_at,
          daysLeft: Math.max(0, Math.floor((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        };
      }));
      
      return processedCampaigns;
    } catch (error) {
      console.error('Error getting favorite campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaigns created by a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} - Created campaigns
   */
  static async getCreatedCampaigns(userId, filters = {}) {
    try {
      let query = `
        SELECT c.*
        FROM campaigns c
        WHERE c.creator_id = ?
      `;
      
      const queryParams = [userId];
      
      // Add status filter
      if (filters.status) {
        query += ' AND c.status = ?';
        queryParams.push(filters.status);
      }
      
      // Add sorting
      query += ' ORDER BY c.created_at DESC';
      
      const [campaigns] = await db.query(query, queryParams);
      
      // Process campaigns
      const processedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
        // Get main images for each campaign
        const [images] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? LIMIT 1',
          [campaign.id, 'main']
        );
        
        // Format the campaign object
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
          imageUrl: images.length > 0 ? images[0].image_url : null,
          daysLeft: Math.max(0, Math.floor((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        };
      }));
      
      return processedCampaigns;
    } catch (error) {
      console.error('Error getting created campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaigns funded by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Funded campaigns
   */
  static async getFundedCampaigns(userId) {
    try {
      const query = `
        SELECT DISTINCT c.*, u.full_name as creator_name, u.profile_image_url as creator_avatar,
                        MAX(con.created_at) as last_contribution_date
        FROM contributions con
        JOIN campaigns c ON con.campaign_id = c.id
        LEFT JOIN users u ON c.creator_id = u.id
        WHERE con.investor_id = ?
        GROUP BY c.id
        ORDER BY last_contribution_date DESC
      `;
      
      const [campaigns] = await db.query(query, [userId]);
      
      // Process campaigns similar to other methods
      const processedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
        // Get main images for each campaign
        const [images] = await db.query(
          'SELECT * FROM campaign_images WHERE campaign_id = ? AND section_type = ? LIMIT 1',
          [campaign.id, 'main']
        );
        
        // Get total amount funded by this user
        const [contributions] = await db.query(
          'SELECT SUM(amount) as total_funded FROM contributions WHERE campaign_id = ? AND investor_id = ?',
          [campaign.id, userId]
        );
        
        const totalFunded = contributions[0].total_funded || 0;
        
        // Format the campaign object
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
          imageUrl: images.length > 0 ? images[0].image_url : null,
          creator: {
            id: campaign.creator_id,
            name: campaign.creator_name || 'Anonymous',
            avatar: campaign.creator_avatar
          },
          lastContributionDate: campaign.last_contribution_date,
          totalFunded: totalFunded,
          daysLeft: Math.max(0, Math.floor((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        };
      }));
      
      return processedCampaigns;
    } catch (error) {
      console.error('Error getting funded campaigns:', error);
      throw error;
    }
  }
}