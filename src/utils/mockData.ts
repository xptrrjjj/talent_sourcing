import { Company, SavedPosition } from '../types';
import { nanoid } from 'nanoid';

// Mock Users
export const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: '3', name: 'Bob Wilson', email: 'bob.wilson@example.com' }
];

// Mock Companies
export const mockCompanies: Company[] = [
  {
    id: nanoid(),
    name: 'TechCorp Solutions',
    website: 'https://techcorp.com',
    contactName: 'Alice Johnson',
    source: 'LinkedIn',
    onshoreLocation: 'United States',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: nanoid(),
    name: 'Global Innovations Inc',
    website: 'https://globalinnovations.com',
    contactName: 'Michael Brown',
    source: 'Referral',
    onshoreLocation: 'Canada',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  },
  {
    id: nanoid(),
    name: 'Digital Dynamics',
    website: 'https://digitaldynamics.io',
    contactName: 'Sarah Chen',
    source: 'Direct',
    onshoreLocation: 'Australia',
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString()
  }
];

// Mock Positions
export const mockPositions: SavedPosition[] = [
  {
    id: nanoid(),
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString(),
    userId: '1',
    userName: 'John Doe',
    status: 'active',
    companyData: {
      companyName: 'TechCorp Solutions',
      website: 'https://techcorp.com',
      contactName: 'Alice Johnson',
      source: 'LinkedIn',
      onshoreLocation: 'United States'
    },
    formData: {
      jobTitle: 'Senior Full Stack Developer',
      companyId: mockCompanies[0].id,
      onshoreLocation: 'United States',
      requiredSkills: 'React, Node.js, TypeScript, AWS, MongoDB',
      experienceLevel: 'Senior',
      educationLevel: "Bachelor's Degree",
      employmentType: 'Full Time'
    },
    analysis: {
      jobDescription: {
        overview: 'Looking for a senior full-stack developer to join our growing team.',
        responsibilities: [
          'Design and implement scalable web applications',
          'Lead technical architecture decisions',
          'Mentor junior developers'
        ],
        requirements: [
          '5+ years of experience with modern web technologies',
          'Strong knowledge of React and Node.js',
          'Experience with cloud platforms (AWS preferred)'
        ],
        benefits: [
          'Competitive salary',
          'Remote work options',
          'Health insurance',
          'Professional development budget'
        ]
      },
      talentPoolSize: 5000,
      onshoreSalaryRange: { min: 120000, max: 180000 },
      offshoreSalaryRange: { min: 40000, max: 60000 },
      sources: [
        { name: 'Stack Overflow Survey 2023', url: 'https://stackoverflow.com/survey/2023' },
        { name: 'GitHub State of Octoverse', url: 'https://octoverse.github.com/' }
      ]
    }
  },
  {
    id: nanoid(),
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
    userId: '2',
    userName: 'Jane Smith',
    status: 'draft',
    companyData: {
      companyName: 'Global Innovations Inc',
      website: 'https://globalinnovations.com',
      contactName: 'Michael Brown',
      source: 'Referral',
      onshoreLocation: 'Canada'
    },
    formData: {
      jobTitle: 'DevOps Engineer',
      companyId: mockCompanies[1].id,
      onshoreLocation: 'Canada',
      requiredSkills: 'Kubernetes, Docker, Jenkins, Terraform, AWS',
      experienceLevel: 'Mid Level',
      educationLevel: "Bachelor's Degree",
      employmentType: 'Full Time'
    },
    analysis: {
      jobDescription: {
        overview: 'Seeking a DevOps engineer to improve our CI/CD pipeline and cloud infrastructure.',
        responsibilities: [
          'Maintain and improve CI/CD pipelines',
          'Manage cloud infrastructure',
          'Implement security best practices'
        ],
        requirements: [
          '3+ years of DevOps experience',
          'Strong knowledge of containerization',
          'Experience with infrastructure as code'
        ],
        benefits: [
          'Competitive salary',
          'Flexible hours',
          'Learning budget',
          '4 weeks vacation'
        ]
      },
      talentPoolSize: 3000,
      onshoreSalaryRange: { min: 100000, max: 150000 },
      offshoreSalaryRange: { min: 35000, max: 50000 },
      sources: [
        { name: 'DevOps Salary Survey 2023', url: 'https://devops.com/salary-survey-2023' },
        { name: 'Cloud Native Report', url: 'https://www.cncf.io/reports/2023' }
      ]
    }
  },
  {
    id: nanoid(),
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date('2024-02-20').toISOString(),
    userId: '1',
    userName: 'John Doe',
    status: 'archived',
    companyData: {
      companyName: 'Digital Dynamics',
      website: 'https://digitaldynamics.io',
      contactName: 'Sarah Chen',
      source: 'Direct',
      onshoreLocation: 'Australia'
    },
    formData: {
      jobTitle: 'Mobile App Developer',
      companyId: mockCompanies[2].id,
      onshoreLocation: 'Australia',
      requiredSkills: 'React Native, iOS, Android, TypeScript, Firebase',
      experienceLevel: 'Mid Level',
      educationLevel: "Bachelor's Degree",
      employmentType: 'Full Time'
    },
    analysis: {
      jobDescription: {
        overview: 'Looking for a mobile developer to build cross-platform applications.',
        responsibilities: [
          'Develop mobile applications using React Native',
          'Implement new features and maintain existing ones',
          'Optimize application performance'
        ],
        requirements: [
          '3+ years of mobile development experience',
          'Experience with React Native',
          'Knowledge of native iOS or Android development'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Remote work options',
          'Annual bonus'
        ]
      },
      talentPoolSize: 2500,
      onshoreSalaryRange: { min: 90000, max: 130000 },
      offshoreSalaryRange: { min: 30000, max: 45000 },
      sources: [
        { name: 'Mobile Dev Survey 2023', url: 'https://mobiledev.com/survey/2023' },
        { name: 'React Native Market Report', url: 'https://reactnative.dev/reports/2023' }
      ]
    }
  }
];