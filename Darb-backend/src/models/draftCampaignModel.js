// src/models/draftCampaignModel.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * DraftCampaign model handles all database operations related to draft campaigns
 */
class DraftCampaign {
  /**
   * Create a new draft campaign
   * @param {Object} campaignData - Campaign data
   * @param {string} userId - Creator's user ID
   * @returns {Promise<Object>} - The created draft campaign
   */
  static async create(campaignData, userId) {
    try {
      logger.debug('Creating new draft campaign', { userId });
      
      const draftId = uuidv4();
      const now = new Date();
      
      // Store basic campaign information
      const query = `
        INSERT INTO draft_campaigns (
          id, title, description, category, location, stage,
          target_amount, minimum_investment, creator_id, created_at, updated_at, end_date,
          data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Store additional data as JSON for flexibility
      const additionalData = JSON.stringify({
        projectDuration: campaignData.projectDuration || {},
        financials: campaignData.financials || {}
      });

      await db.query(query, [
        draftId,
        campaignData.title || '',
        campaignData.description || '',
        campaignData.category || '',
        campaignData.location || '',
        campaignData.stage || 'concept',
        campaignData.financials?.targetAmount || campaignData.targetAmount || 0,
        campaignData.financials?.minimumInvestment || 0,
        userId,
        now,
        now,
        campaignData.endDate || campaignData.projectDuration?.endDate || null,
        additionalData
      ]);

      logger.debug('Draft campaign basic info saved', { draftId, userId });

      // Process problem statement
      if (campaignData.problemStatement) {
        await db.query(
          'INSERT INTO draft_campaign_sections (draft_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [draftId, 'problem_statement', campaignData.problemStatement.content || '', now, now]
        );
        
        // Process problem statement images
        if (campaignData.problemStatement.images && campaignData.problemStatement.images.length > 0) {
          for (const image of campaignData.problemStatement.images) {
            await db.query(
              'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [draftId, 'problem_statement', image.url || image.preview, now]
            );
          }
        }
        
        logger.debug('Draft campaign problem statement saved', { draftId, hasImages: campaignData.problemStatement.images?.length > 0 });
      }

      // Process solution
      if (campaignData.solution) {
        await db.query(
          'INSERT INTO draft_campaign_sections (draft_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [draftId, 'solution', campaignData.solution.content || '', now, now]
        );
        
        // Process solution images
        if (campaignData.solution.images && campaignData.solution.images.length > 0) {
          for (const image of campaignData.solution.images) {
            await db.query(
              'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [draftId, 'solution', image.url || image.preview, now]
            );
          }
        }
        
        logger.debug('Draft campaign solution saved', { draftId, hasImages: campaignData.solution.images?.length > 0 });
      }

      // Process main campaign images
      if (campaignData.images && campaignData.images.length > 0) {
        for (const image of campaignData.images) {
          await db.query(
            'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
            [draftId, 'main', image.url || image.preview, now]
          );
        }
        
        logger.debug('Draft campaign main images saved', { draftId, imageCount: campaignData.images.length });
      }

      // Process pitch asset
      if (campaignData.pitchAsset) {
        await db.query(
          'INSERT INTO draft_campaign_assets (draft_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
          [draftId, 'pitch', campaignData.pitchAsset.url || campaignData.pitchAsset.preview, campaignData.pitchAsset.type || 'image', now]
        );
        
        logger.debug('Draft campaign pitch asset saved', { draftId });
      }

      // Process business plan
      if (campaignData.businessPlan) {
        await db.query(
          'INSERT INTO draft_campaign_assets (draft_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
          [draftId, 'business_plan', campaignData.businessPlan.url, 'document', now]
        );
        
        logger.debug('Draft campaign business plan saved', { draftId });
      }

      // Process milestones
      if (campaignData.financials?.milestones && campaignData.financials.milestones.length > 0) {
        for (const milestone of campaignData.financials.milestones) {
          const milestoneId = milestone.id || uuidv4();
          
          await db.query(
            `INSERT INTO draft_milestones (
              id, draft_id, title, deliverables, amount, target_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              milestoneId,
              draftId,
              milestone.title || '',
              milestone.deliverables || '',
              milestone.amount || 0,
              milestone.targetDate || null,
              now,
              now
            ]
          );

          // Process milestone image if exists
          if (milestone.image) {
            await db.query(
              'INSERT INTO draft_campaign_images (draft_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
              [draftId, 'milestone', milestoneId, milestone.image.url || milestone.image.preview, now]
            );
          }
        }
        
        logger.debug('Draft campaign milestones saved', { 
          draftId, 
          milestoneCount: campaignData.financials.milestones.length 
        });
      }

      // Process team members
      if (campaignData.team && campaignData.team.length > 0) {
        for (const member of campaignData.team) {
          const memberId = member.id || uuidv4();
          
          await db.query(
            `INSERT INTO draft_team_members (
              id, draft_id, name, role, bio, email, linkedin, twitter, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              memberId,
              draftId,
              member.name || '',
              member.role || '',
              member.bio || '',
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
              'UPDATE draft_team_members SET image_url = ? WHERE id = ?',
              [member.image.url || member.image.preview, memberId]
            );
          }
        }
        
        logger.debug('Draft campaign team members saved', { 
          draftId, 
          teamMemberCount: campaignData.team.length 
        });
      }

      // Process risks
      if (campaignData.risks?.items && campaignData.risks.items.length > 0) {
        for (const risk of campaignData.risks.items) {
          await db.query(
            `INSERT INTO draft_risks (
              id, draft_id, category, description, mitigation, impact, likelihood, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              risk.id || uuidv4(),
              draftId,
              risk.category || '',
              risk.description || '',
              risk.mitigation || '',
              risk.impact || 'medium',
              risk.likelihood || 'medium',
              now,
              now
            ]
          );
        }
        
        logger.debug('Draft campaign risks saved', { 
          draftId, 
          riskCount: campaignData.risks.items.length 
        });
      }

      // Return the created draft campaign
      logger.info('Draft campaign created successfully', { draftId, userId });
      return await this.getById(draftId);
    } catch (error) {
      logger.error('Error creating draft campaign:', error);
      throw error;
    }
  }

  /**
   * Update an existing draft campaign
   * @param {string} draftId - Draft campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise<Object>} - The updated draft campaign
   */
  static async update(draftId, campaignData) {
    try {
      logger.debug(`Updating draft campaign ${draftId}`, { draftId });
      
      const now = new Date();
      
      // Update basic campaign information
      const query = `
        UPDATE draft_campaigns SET
          title = ?,
          description = ?,
          category = ?,
          location = ?,
          stage = ?,
          target_amount = ?,
          minimum_investment = ?,
          updated_at = ?,
          end_date = ?,
          data = ?
        WHERE id = ?
      `;

      // Update additional data
      const additionalData = JSON.stringify({
        projectDuration: campaignData.projectDuration || {},
        financials: campaignData.financials || {}
      });

      await db.query(query, [
        campaignData.title || '',
        campaignData.description || '',
        campaignData.category || '',
        campaignData.location || '',
        campaignData.stage || 'concept',
        campaignData.financials?.targetAmount || campaignData.targetAmount || 0,
        campaignData.financials?.minimumInvestment || 0,
        now,
        campaignData.endDate || campaignData.projectDuration?.endDate || null,
        additionalData,
        draftId
      ]);
      
      logger.debug('Draft campaign basic info updated', { draftId });

      // Update problem statement
      if (campaignData.problemStatement) {
        // Check if problem statement exists
        const [existingProblemStatement] = await db.query(
          'SELECT id FROM draft_campaign_sections WHERE draft_id = ? AND section_type = ?',
          [draftId, 'problem_statement']
        );

        if (existingProblemStatement.length > 0) {
          await db.query(
            'UPDATE draft_campaign_sections SET content = ?, updated_at = ? WHERE draft_id = ? AND section_type = ?',
            [campaignData.problemStatement.content || '', now, draftId, 'problem_statement']
          );
        } else {
          await db.query(
            'INSERT INTO draft_campaign_sections (draft_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [draftId, 'problem_statement', campaignData.problemStatement.content || '', now, now]
          );
        }
        
        // Handle problem statement images
        if (campaignData.problemStatement.images && campaignData.problemStatement.images.length > 0) {
          // Remove existing images
          await db.query(
            'DELETE FROM draft_campaign_images WHERE draft_id = ? AND section_type = ?',
            [draftId, 'problem_statement']
          );
          
          // Add new images
          for (const image of campaignData.problemStatement.images) {
            await db.query(
              'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [draftId, 'problem_statement', image.url || image.preview, now]
            );
          }
        }
        
        logger.debug('Draft campaign problem statement updated', { 
          draftId, 
          hasImages: campaignData.problemStatement.images?.length > 0 
        });
      }

      // Update solution
      if (campaignData.solution) {
        const [existingSolution] = await db.query(
          'SELECT id FROM draft_campaign_sections WHERE draft_id = ? AND section_type = ?',
          [draftId, 'solution']
        );

        if (existingSolution.length > 0) {
          await db.query(
            'UPDATE draft_campaign_sections SET content = ?, updated_at = ? WHERE draft_id = ? AND section_type = ?',
            [campaignData.solution.content || '', now, draftId, 'solution']
          );
        } else {
          await db.query(
            'INSERT INTO draft_campaign_sections (draft_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [draftId, 'solution', campaignData.solution.content || '', now, now]
          );
        }
        
        // Handle solution images
        if (campaignData.solution.images && campaignData.solution.images.length > 0) {
          await db.query(
            'DELETE FROM draft_campaign_images WHERE draft_id = ? AND section_type = ?',
            [draftId, 'solution']
          );
          
          for (const image of campaignData.solution.images) {
            await db.query(
              'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [draftId, 'solution', image.url || image.preview, now]
            );
          }
        }
        
        logger.debug('Draft campaign solution updated', { 
          draftId, 
          hasImages: campaignData.solution.images?.length > 0 
        });
      }

      // Update main campaign images
      if (campaignData.images && campaignData.images.length > 0) {
        await db.query(
          'DELETE FROM draft_campaign_images WHERE draft_id = ? AND section_type = ?',
          [draftId, 'main']
        );
        
        for (const image of campaignData.images) {
          await db.query(
            'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
            [draftId, 'main', image.url || image.preview, now]
          );
        }
        
        logger.debug('Draft campaign main images updated', { 
          draftId, 
          imageCount: campaignData.images.length 
        });
      }

      // Update pitch asset
      if (campaignData.pitchAsset) {
        const [existingPitchAsset] = await db.query(
          'SELECT id FROM draft_campaign_assets WHERE draft_id = ? AND asset_type = ?',
          [draftId, 'pitch']
        );

        if (existingPitchAsset.length > 0) {
          await db.query(
            'UPDATE draft_campaign_assets SET asset_url = ?, media_type = ?, updated_at = ? WHERE draft_id = ? AND asset_type = ?',
            [campaignData.pitchAsset.url || campaignData.pitchAsset.preview, campaignData.pitchAsset.type || 'image', now, draftId, 'pitch']
          );
        } else {
          await db.query(
            'INSERT INTO draft_campaign_assets (draft_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
            [draftId, 'pitch', campaignData.pitchAsset.url || campaignData.pitchAsset.preview, campaignData.pitchAsset.type || 'image', now]
          );
        }
        
        logger.debug('Draft campaign pitch asset updated', { draftId });
      }

      // Update business plan
      if (campaignData.businessPlan) {
        const [existingBusinessPlan] = await db.query(
          'SELECT id FROM draft_campaign_assets WHERE draft_id = ? AND asset_type = ?',
          [draftId, 'business_plan']
        );

        if (existingBusinessPlan.length > 0) {
          await db.query(
            'UPDATE draft_campaign_assets SET asset_url = ?, updated_at = ? WHERE draft_id = ? AND asset_type = ?',
            [campaignData.businessPlan.url, now, draftId, 'business_plan']
          );
        } else {
          await db.query(
            'INSERT INTO draft_campaign_assets (draft_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
            [draftId, 'business_plan', campaignData.businessPlan.url, 'document', now]
          );
        }
        
        logger.debug('Draft campaign business plan updated', { draftId });
      }

      // Update milestones
      if (campaignData.financials?.milestones) {
        // Get existing milestones
        const [existingMilestones] = await db.query(
          'SELECT id FROM draft_milestones WHERE draft_id = ?',
          [draftId]
        );
        
        // Create a set for existing milestone IDs
        const existingMilestoneIds = new Set(existingMilestones.map(m => m.id));
        
        // Process each milestone
        for (const milestone of campaignData.financials.milestones) {
          if (milestone.id && existingMilestoneIds.has(milestone.id)) {
            // Update existing milestone
            await db.query(
              `UPDATE draft_milestones SET
                title = ?,
                deliverables = ?,
                amount = ?,
                target_date = ?,
                updated_at = ?
              WHERE id = ? AND draft_id = ?`,
              [
                milestone.title || '',
                milestone.deliverables || '',
                milestone.amount || 0,
                milestone.targetDate || null,
                now,
                milestone.id,
                draftId
              ]
            );
            
            // Update milestone image if exists
            if (milestone.image) {
              const [existingImage] = await db.query(
                'SELECT id FROM draft_campaign_images WHERE draft_id = ? AND section_type = ? AND related_id = ?',
                [draftId, 'milestone', milestone.id]
              );
              
              if (existingImage.length > 0) {
                await db.query(
                  'UPDATE draft_campaign_images SET image_url = ? WHERE id = ?',
                  [milestone.image.url || milestone.image.preview, existingImage[0].id]
                );
              } else {
                await db.query(
                  'INSERT INTO draft_campaign_images (draft_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
                  [draftId, 'milestone', milestone.id, milestone.image.url || milestone.image.preview, now]
                );
              }
            }
            
            // Remove from the set to track which ones need to be deleted
            existingMilestoneIds.delete(milestone.id);
          } else {
            // Create new milestone
            const milestoneId = milestone.id || uuidv4();
            
            await db.query(
              `INSERT INTO draft_milestones (
                id, draft_id, title, deliverables, amount, target_date, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                milestoneId,
                draftId,
                milestone.title || '',
                milestone.deliverables || '',
                milestone.amount || 0,
                milestone.targetDate || null,
                now,
                now
              ]
            );
            
            // Add milestone image if exists
            if (milestone.image) {
              await db.query(
                'INSERT INTO draft_campaign_images (draft_id, section_type, related_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
                [draftId, 'milestone', milestoneId, milestone.image.url || milestone.image.preview, now]
              );
            }
          }
        }
        
        // Delete milestones that were not included in the update
        for (const milestoneId of existingMilestoneIds) {
          await db.query('DELETE FROM draft_milestones WHERE id = ?', [milestoneId]);
          await db.query(
            'DELETE FROM draft_campaign_images WHERE draft_id = ? AND section_type = ? AND related_id = ?',
            [draftId, 'milestone', milestoneId]
          );
        }
        
        logger.debug('Draft campaign milestones updated', { 
          draftId, 
          milestoneCount: campaignData.financials.milestones.length,
          milestonesDeleted: existingMilestoneIds.size
        });
      }

      // Update team members
      if (campaignData.team) {
        // Get existing team members
        const [existingMembers] = await db.query(
          'SELECT id FROM draft_team_members WHERE draft_id = ?',
          [draftId]
        );
        
        // Create a set for existing member IDs
        const existingMemberIds = new Set(existingMembers.map(m => m.id));
        
        // Process each team member
        for (const member of campaignData.team) {
          if (member.id && existingMemberIds.has(member.id)) {
            // Update existing team member
            await db.query(
              `UPDATE draft_team_members SET
                name = ?,
                role = ?,
                bio = ?,
                email = ?,
                linkedin = ?,
                twitter = ?,
                updated_at = ?
              WHERE id = ? AND draft_id = ?`,
              [
                member.name || '',
                member.role || '',
                member.bio || '',
                member.email || null,
                member.linkedIn || null,
                member.twitter || null,
                now,
                member.id,
                draftId
              ]
            );
            
            // Update team member image if exists
            if (member.image) {
              await db.query(
                'UPDATE draft_team_members SET image_url = ? WHERE id = ?',
                [member.image.url || member.image.preview, member.id]
              );
            }
            
            // Remove from the set to track which ones need to be deleted
            existingMemberIds.delete(member.id);
          } else {
            // Create new team member
            const memberId = member.id || uuidv4();
            
            await db.query(
              `INSERT INTO draft_team_members (
                id, draft_id, name, role, bio, email, linkedin, twitter, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                memberId,
                draftId,
                member.name || '',
                member.role || '',
                member.bio || '',
                member.email || null,
                member.linkedIn || null,
                member.twitter || null,
                now,
                now
              ]
            );
            
            // Add team member image if exists
            if (member.image) {
              await db.query(
                'UPDATE draft_team_members SET image_url = ? WHERE id = ?',
                [member.image.url || member.image.preview, memberId]
              );
            }
          }
        }
        
        // Delete team members that were not included in the update
        for (const memberId of existingMemberIds) {
          await db.query('DELETE FROM draft_team_members WHERE id = ?', [memberId]);
        }
        
        logger.debug('Draft campaign team members updated', { 
          draftId, 
          teamMemberCount: campaignData.team.length,
          membersDeleted: existingMemberIds.size
        });
      }

      // Update risks
      if (campaignData.risks?.items) {
        // Get existing risks
        const [existingRisks] = await db.query(
          'SELECT id FROM draft_risks WHERE draft_id = ?',
          [draftId]
        );
        
        // Create a set for existing risk IDs
        const existingRiskIds = new Set(existingRisks.map(r => r.id));
        
        // Process each risk
        for (const risk of campaignData.risks.items) {
          if (risk.id && existingRiskIds.has(risk.id)) {
            // Update existing risk
            await db.query(
              `UPDATE draft_risks SET
                category = ?,
                description = ?,
                mitigation = ?,
                impact = ?,
                likelihood = ?,
                updated_at = ?
              WHERE id = ? AND draft_id = ?`,
              [
                risk.category || '',
                risk.description || '',
                risk.mitigation || '',
                risk.impact || 'medium',
                risk.likelihood || 'medium',
                now,
                risk.id,
                draftId
              ]
            );
            
            // Remove from the set to track which ones need to be deleted
            existingRiskIds.delete(risk.id);
          } else {
            // Create new risk
            const riskId = risk.id || uuidv4();
            
            await db.query(
              `INSERT INTO draft_risks (
                id, draft_id, category, description, mitigation, impact, likelihood, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                riskId,
                draftId,
                risk.category || '',
                risk.description || '',
                risk.mitigation || '',
                risk.impact || 'medium',
                risk.likelihood || 'medium',
                now,
                now
              ]
            );
          }
        }
        
        // Delete risks that were not included in the update
        for (const riskId of existingRiskIds) {
          await db.query('DELETE FROM draft_risks WHERE id = ?', [riskId]);
        }
        
        logger.debug('Draft campaign risks updated', { 
          draftId, 
          riskCount: campaignData.risks.items.length,
          risksDeleted: existingRiskIds.size
        });
      }

      // Return the updated draft campaign
      logger.info('Draft campaign updated successfully', { draftId });
      return await this.getById(draftId);
    } catch (error) {
      logger.error('Error updating draft campaign:', error);
      throw error;
    }
  }

  /**
   * Get a draft campaign by ID with all related data
   * @param {string} id - Draft campaign ID
   * @returns {Promise<Object>} - The draft campaign with all related data
   */
  static async getById(id) {
    try {
      logger.debug(`Getting draft campaign by ID: ${id}`, { draftId: id });
      
      // Get basic draft campaign information
      const [drafts] = await db.query(`
        SELECT d.*, u.full_name as creator_name, u.profile_image_url as creator_avatar, u.id as creator_id
        FROM draft_campaigns d
        LEFT JOIN users u ON d.creator_id = u.id
        WHERE d.id = ?
      `, [id]);
      
      if (drafts.length === 0) {
        logger.warn(`Draft campaign not found: ${id}`, { draftId: id });
        return null;
      }
      
      const draft = drafts[0];
      
      // Parse additional data
      try {
        const additionalData = JSON.parse(draft.data || '{}');
        draft.projectDuration = additionalData.projectDuration || {};
        draft.financials = additionalData.financials || {};
      } catch (e) {
        logger.error('Error parsing draft data JSON:', e);
        draft.projectDuration = {};
        draft.financials = {};
      }
      
      // Get campaign sections (problem statement, solution)
      const [sections] = await db.query(
        'SELECT * FROM draft_campaign_sections WHERE draft_id = ?',
        [id]
      );
      
      // Process sections
      draft.problemStatement = { content: '' };
      draft.solution = { content: '' };
      
      for (const section of sections) {
        if (section.section_type === 'problem_statement') {
          draft.problemStatement.content = section.content;
        } else if (section.section_type === 'solution') {
          draft.solution.content = section.content;
        }
      }
      
      // Get campaign images
      const [images] = await db.query(
        'SELECT * FROM draft_campaign_images WHERE draft_id = ?',
        [id]
      );
      
      // Process main images
      draft.images = images
        .filter(img => img.section_type === 'main')
        .map(img => ({ url: img.image_url, preview: img.image_url }));
      
      // Process problem statement images
      draft.problemStatement.images = images
        .filter(img => img.section_type === 'problem_statement')
        .map(img => ({ url: img.image_url, preview: img.image_url }));
      
      // Process solution images
      draft.solution.images = images
        .filter(img => img.section_type === 'solution')
        .map(img => ({ url: img.image_url, preview: img.image_url }));
      
      // Get campaign assets (pitch asset, business plan)
      const [assets] = await db.query(
        'SELECT * FROM draft_campaign_assets WHERE draft_id = ?',
        [id]
      );
      
      // Process assets
      for (const asset of assets) {
        if (asset.asset_type === 'pitch') {
          draft.pitchAsset = {
            type: asset.media_type,
            url: asset.asset_url,
            preview: asset.asset_url
          };
        } else if (asset.asset_type === 'business_plan') {
          draft.businessPlan = {
            url: asset.asset_url,
            name: 'Business Plan'
          };
        }
      }
      
      // Get milestones
      const [milestones] = await db.query(
        'SELECT * FROM draft_milestones WHERE draft_id = ? ORDER BY target_date ASC',
        [id]
      );
      
      // Process milestones
      if (!draft.financials) {
        draft.financials = {};
      }
      
      draft.financials.targetAmount = draft.target_amount;
      draft.financials.minimumInvestment = draft.minimum_investment;
      draft.financials.milestones = await Promise.all(milestones.map(async (milestone) => {
        // Get milestone image
        const [milestoneImages] = await db.query(
          'SELECT * FROM draft_campaign_images WHERE draft_id = ? AND section_type = ? AND related_id = ?',
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
      }));
      
      // Get team members
      const [teamMembers] = await db.query(
        'SELECT * FROM draft_team_members WHERE draft_id = ?',
        [id]
      );
      
      // Process team members
      draft.team = teamMembers.map(member => {
        return {
          id: member.id,
          name: member.name,
          role: member.role,
          bio: member.bio,
          email: member.email,
          linkedIn: member.linkedin,
          twitter: member.twitter,
          image: member.image_url ? { url: member.image_url, preview: member.image_url } : null
        };
      });
      
      // Get risks
      const [risks] = await db.query(
        'SELECT * FROM draft_risks WHERE draft_id = ?',
        [id]
      );
      
      // Process risks
      draft.risks = {
        items: risks.map(risk => ({
          id: risk.id,
          category: risk.category,
          description: risk.description,
          mitigation: risk.mitigation,
          impact: risk.impact,
          likelihood: risk.likelihood
        }))
      };
      
      // Format dates
      draft.createdAt = draft.created_at;
      draft.updatedAt = draft.updated_at;
      draft.endDate = draft.end_date;
      
      delete draft.created_at;
      delete draft.updated_at;
      delete draft.end_date;
      
      // Convert snake_case to camelCase for remaining fields
      draft.targetAmount = draft.target_amount;
      draft.minimumInvestment = draft.minimum_investment;
      
      delete draft.target_amount;
      delete draft.minimum_investment;
      delete draft.data; // Remove raw data json
      
      // Add creator info
      draft.creator = {
        id: draft.creator_id,
        name: draft.creator_name || 'Anonymous',
        avatar: draft.creator_avatar
      };
      
      delete draft.creator_id;
      delete draft.creator_name;
      delete draft.creator_avatar;
      
      logger.debug(`Draft campaign retrieved successfully: ${id}`, { draftId: id });
      return draft;
    } catch (error) {
      logger.error(`Error getting draft campaign by ID: ${id}`, error);
      throw error;
    }
  }
  
  /**
   * Get all draft campaigns for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of draft campaigns
   */
  static async getByUserId(userId) {
    try {
      logger.debug(`Getting all draft campaigns for user ${userId}`, { userId });
      
      const [drafts] = await db.query(`
        SELECT d.*, u.full_name as creator_name
        FROM draft_campaigns d
        LEFT JOIN users u ON d.creator_id = u.id
        WHERE d.creator_id = ?
        ORDER BY d.updated_at DESC
      `, [userId]);
      
      return Promise.all(drafts.map(async draft => {
        // Get main image for each draft
        const [images] = await db.query(
          'SELECT * FROM draft_campaign_images WHERE draft_id = ? AND section_type = ? LIMIT 1',
          [draft.id, 'main']
        );
        
        return {
          id: draft.id,
          title: draft.title || 'Untitled Campaign',
          description: draft.description,
          category: draft.category,
          location: draft.location,
          stage: draft.stage,
          targetAmount: draft.target_amount,
          minimumInvestment: draft.minimum_investment,
          createdAt: draft.created_at,
          updatedAt: draft.updated_at,
          endDate: draft.end_date,
          imageUrl: images.length > 0 ? images[0].image_url : null,
          creator: {
            id: draft.creator_id,
            name: draft.creator_name
          }
        };
      }));
    } catch (error) {
      logger.error(`Error getting user draft campaigns for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a draft campaign
   * @param {string} id - Draft campaign ID
   * @returns {Promise<boolean>} - True if successful
   */
  static async delete(id) {
    try {
      logger.debug(`Deleting draft campaign ${id}`, { draftId: id });
      
      // Start a transaction
      await db.query('START TRANSACTION');
      
      // Delete all related records
      await db.query('DELETE FROM draft_campaign_images WHERE draft_id = ?', [id]);
      await db.query('DELETE FROM draft_campaign_assets WHERE draft_id = ?', [id]);
      await db.query('DELETE FROM draft_campaign_sections WHERE draft_id = ?', [id]);
      await db.query('DELETE FROM draft_milestones WHERE draft_id = ?', [id]);
      await db.query('DELETE FROM draft_team_members WHERE draft_id = ?', [id]);
      await db.query('DELETE FROM draft_risks WHERE draft_id = ?', [id]);
      
      // Delete the draft campaign itself
      await db.query('DELETE FROM draft_campaigns WHERE id = ?', [id]);
      
      // Commit the transaction
      await db.query('COMMIT');
      
      logger.info(`Draft campaign ${id} deleted successfully`, { draftId: id });
      return true;
    } catch (error) {
      // Rollback the transaction in case of error
      await db.query('ROLLBACK');
      logger.error(`Error deleting draft campaign ${id}:`, error);
      throw error;
    }
  }

  /**
 * Publish a draft campaign (convert to active campaign)
 * @param {string} draftId - Draft campaign ID
 * @returns {Promise<Object>} - The created campaign
 */
static async publish(draftId) {
  try {
    logger.debug(`Publishing draft campaign ${draftId}`, { draftId });
    
    // Get the draft with all related data
    const draft = await this.getById(draftId);
    
    if (!draft) {
      logger.error(`Draft campaign not found: ${draftId}`, { draftId });
      throw new Error('Draft campaign not found');
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    try {
      // Convert the draft to a published campaign with pending_approval status
      const campaignId = uuidv4();
      const now = new Date();
      
      // Insert basic campaign information
      const query = `
        INSERT INTO campaigns (
          id, title, description, category, location, stage,
          target_amount, minimum_investment, current_amount,
          creator_id, status, created_at, updated_at, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(query, [
        campaignId,
        draft.title,
        draft.description,
        draft.category,
        draft.location,
        draft.stage || 'concept',
        draft.financials?.targetAmount || draft.targetAmount || 0,
        draft.financials?.minimumInvestment || draft.minimumInvestment || 0,
        0, // Initial current_amount is 0
        draft.creator.id,
        'pending_approval', // Set to pending approval instead of active
        now,
        now,
        draft.endDate || draft.projectDuration?.endDate
      ]);
      
      // Process all related data (images, sections, etc.) here...
      // [existing code to transfer all data from draft to campaign]
      
      // Delete the draft after successful publication
      try {
        logger.debug(`Attempting to delete draft ${draftId} after publishing`, { draftId });
        
        // Delete all related records
        await db.query('DELETE FROM draft_campaign_images WHERE draft_id = ?', [draftId]);
        await db.query('DELETE FROM draft_campaign_assets WHERE draft_id = ?', [draftId]);
        await db.query('DELETE FROM draft_campaign_sections WHERE draft_id = ?', [draftId]);
        await db.query('DELETE FROM draft_milestones WHERE draft_id = ?', [draftId]);
        await db.query('DELETE FROM draft_team_members WHERE draft_id = ?', [draftId]);
        await db.query('DELETE FROM draft_risks WHERE draft_id = ?', [draftId]);
        
        // Delete the draft campaign itself
        await db.query('DELETE FROM draft_campaigns WHERE id = ?', [draftId]);
        
        logger.info(`Draft ${draftId} successfully deleted after publishing to campaign ${campaignId}`, { 
          draftId,
          campaignId
        });
      } catch (deleteError) {
        // Log but don't fail the transaction if deletion has issues
        logger.error(`Error deleting draft ${draftId} after publishing:`, deleteError);
        
        // Try again with a simpler approach
        try {
          await db.query('DELETE FROM draft_campaigns WHERE id = ?', [draftId]);
          logger.info(`Successfully deleted draft ${draftId} main record`, { draftId });
        } catch (simpleDeletionError) {
          logger.error(`Failed even simple deletion for draft ${draftId}:`, simpleDeletionError);
        }
        
        // We continue anyway since the campaign is created, orphaned draft records
        // are better than failed publishing
      }
      
      // Commit the transaction
      await db.query('COMMIT');
      
      // Get the published campaign (we construct a basic object here to avoid another DB query)
      const campaign = {
        id: campaignId,
        title: draft.title,
        description: draft.description,
        category: draft.category,
        status: 'pending_approval',
        createdAt: now,
        creator: draft.creator
      };
      
      logger.info(`Draft ${draftId} published successfully as campaign ${campaignId}`, { 
        draftId, 
        campaignId,
        status: 'pending_approval'
      });
      
      return campaign;
    } catch (error) {
      // Rollback the transaction in case of error
      await db.query('ROLLBACK');
      logger.error(`Error during draft publication: ${draftId}`, error);
      throw error;
    }
  } catch (error) {
    logger.error(`Error publishing draft campaign ${draftId}:`, error);
    throw error;
  }
}
  
/**
 * Publish a draft campaign (convert to active campaign)
 * @param {string} draftId - Draft campaign ID
 * @returns {Promise<Object>} - The created campaign
 */
static async publish(draftId) {
  try {
    logger.debug(`Publishing draft campaign ${draftId}`, { draftId });
    
    // Get the draft with all related data
    const draft = await this.getById(draftId);
    
    if (!draft) {
      logger.error(`Draft campaign not found: ${draftId}`, { draftId });
      throw new Error('Draft campaign not found');
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    try {
      // Convert the draft to a published campaign with pending_approval status
      const campaignId = uuidv4();
      const now = new Date();
      
      // Insert basic campaign information
      const query = `
        INSERT INTO campaigns (
          id, title, description, category, location, stage,
          target_amount, minimum_investment, current_amount,
          creator_id, status, created_at, updated_at, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(query, [
        campaignId,
        draft.title,
        draft.description,
        draft.category,
        draft.location,
        draft.stage || 'concept',
        draft.financials?.targetAmount || draft.targetAmount || 0,
        draft.financials?.minimumInvestment || draft.minimumInvestment || 0,
        0, // Initial current_amount is 0
        draft.creator.id,
        'pending_approval', // Set to pending approval instead of active
        now,
        now,
        draft.endDate || draft.projectDuration?.endDate
      ]);
      
      logger.debug(`Published campaign basic info inserted with ID: ${campaignId}`, { 
        draftId, 
        campaignId 
      });

      // Process problem statement
      if (draft.problemStatement && draft.problemStatement.content) {
        await db.query(
          'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'problem_statement', draft.problemStatement.content, now, now]
        );
        
        // Process problem statement images
        if (draft.problemStatement.images && draft.problemStatement.images.length > 0) {
          for (const image of draft.problemStatement.images) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [campaignId, 'problem_statement', image.url || image.preview, now]
            );
          }
        }
      }

      // Process solution
      if (draft.solution && draft.solution.content) {
        await db.query(
          'INSERT INTO campaign_sections (campaign_id, section_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'solution', draft.solution.content, now, now]
        );
        
        // Process solution images
        if (draft.solution.images && draft.solution.images.length > 0) {
          for (const image of draft.solution.images) {
            await db.query(
              'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
              [campaignId, 'solution', image.url || image.preview, now]
            );
          }
        }
      }

      // Process main campaign images
      if (draft.images && draft.images.length > 0) {
        for (const image of draft.images) {
          await db.query(
            'INSERT INTO campaign_images (campaign_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
            [campaignId, 'main', image.url || image.preview, now]
          );
        }
      }

      // Process pitch asset
      if (draft.pitchAsset) {
        await db.query(
          'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'pitch', draft.pitchAsset.url || draft.pitchAsset.preview, draft.pitchAsset.type || 'image', now]
        );
      }

      // Process business plan
      if (draft.businessPlan) {
        await db.query(
          'INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, 'business_plan', draft.businessPlan.url, 'document', now]
        );
      }

      // Process milestones
      if (draft.financials?.milestones && draft.financials.milestones.length > 0) {
        for (const milestone of draft.financials.milestones) {
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
      if (draft.team && draft.team.length > 0) {
        for (const member of draft.team) {
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

      draft.images = images
  .filter(img => img.section_type === 'main')
  .map(img => ({ url: img.image_url, preview: img.image_url }));

// Empty check for problem statement images
draft.problemStatement.images = images
  .filter(img => img.section_type === 'problem_statement')
  .map(img => ({ url: img.image_url, preview: img.image_url }));

// Empty check for solution images
draft.solution.images = images
  .filter(img => img.section_type === 'solution')
  .map(img => ({ url: img.image_url, preview: img.image_url }));

// In the create method, only save images if they exist:
// From:
if (campaignData.problemStatement.images && campaignData.problemStatement.images.length > 0) {
  for (const image of campaignData.problemStatement.images) {
    await db.query(
      'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
      [draftId, 'problem_statement', image.url || image.preview, now]
    );
  }
}

// To make all image handling sections check for both existence and non-empty arrays:
if (campaignData.images && Array.isArray(campaignData.images) && campaignData.images.length > 0) {
  for (const image of campaignData.images) {
    if (image && (image.url || image.preview)) {
      await db.query(
        'INSERT INTO draft_campaign_images (draft_id, section_type, image_url, created_at) VALUES (?, ?, ?, ?)',
        [draftId, 'main', image.url || image.preview, now]
      );
    }
  }
}

      // Process risks
      if (draft.risks?.items && draft.risks.items.length > 0) {
        for (const risk of draft.risks.items) {
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
      
      // Delete the draft after successful publication
      await this.delete(draftId);
      
      // Commit the transaction
      await db.query('COMMIT');
      
      // Get the published campaign (we construct a basic object here to avoid another DB query)
      const campaign = {
        id: campaignId,
        title: draft.title,
        description: draft.description,
        category: draft.category,
        status: 'pending_approval',
        createdAt: now,
        creator: draft.creator
      };
      
      logger.info(`Draft ${draftId} published successfully as campaign ${campaignId}`, { 
        draftId, 
        campaignId,
        status: 'pending_approval'
      });
      
      return campaign;
    } catch (error) {
      // Rollback the transaction in case of error
      await db.query('ROLLBACK');
      logger.error(`Error during draft publication: ${draftId}`, error);
      throw error;
    }
  } catch (error) {
    logger.error(`Error publishing draft campaign ${draftId}:`, error);
    throw error;
  }
}
}

module.exports = DraftCampaign;