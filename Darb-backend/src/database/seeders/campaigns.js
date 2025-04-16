// src/database/seeders/campaigns.js
/**
 * Sample campaign data for development and testing
 */
const { v4: uuidv4 } = require('uuid');

// Current timestamp for created/updated dates
const now = new Date();

// Sample campaigns
const campaigns = [
  {
    id: uuidv4(),
    title: "EcoCharge - Wireless EV Charging Technology",
    description: "Revolutionary wireless charging technology for electric vehicles that allows drivers to charge their EVs without plugging in. The technology uses magnetic resonance to transfer power efficiently.",
    category: "Energy & Green Tech",
    location: "Lagos, Nigeria",
    stage: "prototype",
    target_amount: 1500000,
    current_amount: 550000,
    minimum_investment: 5000,
    creator_id: 2, // Reference to startup user
    status: "active",
    view_count: 243,
    featured: true,
    start_date: now,
    end_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    title: "AgroTech - Farm Management System",
    description: "Integrated software and IoT solution for Nigerian farmers to optimize crop yields, monitor soil conditions, and manage farm operations efficiently.",
    category: "Agriculture",
    location: "Abuja, Nigeria",
    stage: "mvp",
    target_amount: 1200000,
    current_amount: 300000,
    minimum_investment: 2000,
    creator_id: 2, // Reference to startup user
    status: "active",
    view_count: 178,
    featured: false,
    start_date: now,
    end_date: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    title: "MediConnect - Healthcare Appointment Platform",
    description: "Mobile platform connecting patients with healthcare providers for virtual and in-person appointments, improving healthcare access across Nigeria.",
    category: "Healthcare",
    location: "Port Harcourt, Nigeria",
    stage: "market",
    target_amount: 2000000,
    current_amount: 1200000,
    minimum_investment: 10000,
    creator_id: 2, // Reference to startup user
    status: "active",
    view_count: 342,
    featured: true,
    start_date: now,
    end_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    created_at: now,
    updated_at: now
  }
];

// Create the sections, assets, images, milestones, etc. for the campaigns
const createCampaignData = (campaignId, campaign) => {
  // Problem statement
  const problemStatement = {
    campaign_id: campaignId,
    section_type: 'problem_statement',
    content: `The problem we're addressing with ${campaign.title} is significant and growing. Our market research shows a clear need for innovative solutions in this space.`,
    created_at: now,
    updated_at: now
  };
  
  // Solution
  const solution = {
    campaign_id: campaignId,
    section_type: 'solution',
    content: `Our solution leverages cutting-edge technology to address the challenges in a unique way. ${campaign.title} provides an efficient, cost-effective approach that outperforms existing alternatives.`,
    created_at: now,
    updated_at: now
  };
  
  // Campaign images
  const mainImage = {
    campaign_id: campaignId,
    section_type: 'main',
    image_url: `https://example.com/${campaignId}/main.jpg`,
    created_at: now
  };
  
  const problemImage = {
    campaign_id: campaignId,
    section_type: 'problem_statement',
    image_url: `https://example.com/${campaignId}/problem.jpg`,
    created_at: now
  };
  
  const solutionImage = {
    campaign_id: campaignId,
    section_type: 'solution',
    image_url: `https://example.com/${campaignId}/solution.jpg`,
    created_at: now
  };
  
  // Assets
  const pitchAsset = {
    campaign_id: campaignId,
    asset_type: 'pitch',
    asset_url: `https://example.com/${campaignId}/pitch.jpg`,
    media_type: 'image',
    created_at: now,
    updated_at: now
  };
  
  const businessPlan = {
    campaign_id: campaignId,
    asset_type: 'business_plan',
    asset_url: `https://example.com/${campaignId}/business_plan.pdf`,
    media_type: 'document',
    created_at: now,
    updated_at: now
  };
  
  // Milestones
  const milestones = [
    {
      id: uuidv4(),
      campaign_id: campaignId,
      title: 'Research & Development',
      description: 'Complete R&D phase and finalize the technical specifications.',
      target_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      amount: campaign.target_amount * 0.3, // 30% of target
      deliverables: 'Technical specifications document, prototype design',
      status: 'pending',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      campaign_id: campaignId,
      title: 'Prototype Development',
      description: 'Build and test the initial prototype.',
      target_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      amount: campaign.target_amount * 0.4, // 40% of target
      deliverables: 'Working prototype, test results documentation',
      status: 'pending',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      campaign_id: campaignId,
      title: 'Market Launch',
      description: 'Finalize product and launch to market.',
      target_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      amount: campaign.target_amount * 0.3, // 30% of target
      deliverables: 'Final product, marketing materials, launch event',
      status: 'pending',
      created_at: now,
      updated_at: now
    }
  ];
  
  // Team members
  const teamMembers = [
    {
      id: uuidv4(),
      campaign_id: campaignId,
      name: 'John Adeyemi',
      role: 'CEO & Founder',
      bio: 'Experienced entrepreneur with previous successful startups in the technology sector.',
      email: 'john@example.com',
      linkedin: 'linkedin.com/in/johnadeyemi',
      twitter: '@johnadeyemi',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      campaign_id: campaignId,
      name: 'Amina Okafor',
      role: 'CTO',
      bio: 'Technical expert with 10+ years experience in software development and system architecture.',
      email: 'amina@example.com',
      linkedin: 'linkedin.com/in/aminaokafor',
      twitter: '@aminatech',
      created_at: now,
      updated_at: now
    }
  ];
  
  // Risks
  const risks = [
    {
      id: uuidv4(),
      campaign_id: campaignId,
      category: 'Technical Risk',
      description: 'Challenges in scaling the technology to production levels.',
      mitigation: 'Partnership with established manufacturing facilities and phased deployment approach.',
      impact: 'medium',
      likelihood: 'low',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      campaign_id: campaignId,
      category: 'Market Risk',
      description: 'Potential slower adoption rate than projected.',
      mitigation: 'Comprehensive marketing strategy with early adopter incentives and education campaigns.',
      impact: 'high',
      likelihood: 'medium',
      created_at: now,
      updated_at: now
    }
  ];
  
  return {
    sections: [problemStatement, solution],
    images: [mainImage, problemImage, solutionImage],
    assets: [pitchAsset, businessPlan],
    milestones,
    teamMembers,
    risks
  };
};

// Generate additional data for each campaign
const campaignsData = campaigns.map(campaign => ({
  campaign,
  ...createCampaignData(campaign.id, campaign)
}));

// Export the data for use in seeders
module.exports = campaignsData;