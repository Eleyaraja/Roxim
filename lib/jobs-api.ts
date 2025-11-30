// Jobs API Integration
export interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  type: string
  posted: string
  logo?: string
  applyUrl: string
  description: string
  skills: string[]
}

export async function fetchJobs(role?: string, location?: string): Promise<JobListing[]> {
  // For now, return mock data. You can integrate Adzuna API later with your keys
  // Get free API keys from: https://developer.adzuna.com/signup
  
  const appId = process.env.NEXT_PUBLIC_ADZUNA_APP_ID
  const appKey = process.env.NEXT_PUBLIC_ADZUNA_APP_KEY
  
  // If API keys are available, use real API
  if (appId && appKey) {
    try {
      const query = role || 'software developer'
      const country = 'us'
      
      const response = await fetch(
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1?` +
        `app_id=${appId}&app_key=${appKey}&` +
        `results_per_page=12&what=${encodeURIComponent(query)}&` +
        `content-type=application/json`
      )
      
      if (!response.ok) throw new Error('API request failed')
      
      const data = await response.json()
      
      return data.results.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_max ? `$${Math.round(job.salary_min/1000)}k-${Math.round(job.salary_max/1000)}k` : null,
        type: job.contract_time || 'Full-time',
        posted: new Date(job.created).toLocaleDateString(),
        logo: job.company.logo || null,
        applyUrl: job.redirect_url,
        description: job.description,
        skills: job.category.label.split(' ')
      }))
    } catch (error) {
      console.error('Failed to fetch real jobs, using mock data:', error)
    }
  }
  
  // Mock data for demo
  return getMockJobs()
}

function getMockJobs(): JobListing[] {
  return [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$150k-$200k',
      type: 'Full-time',
      posted: '2 days ago',
      logo: null,
      applyUrl: 'https://careers.google.com',
      description: 'Build the next generation of Google products',
      skills: ['React', 'TypeScript', 'Node.js']
    },
    {
      id: '2',
      title: 'Frontend Developer',
      company: 'Meta',
      location: 'Menlo Park, CA',
      salary: '$130k-$180k',
      type: 'Full-time',
      posted: '1 day ago',
      logo: null,
      applyUrl: 'https://www.metacareers.com',
      description: 'Create amazing user experiences',
      skills: ['React', 'JavaScript', 'CSS']
    },
    {
      id: '3',
      title: 'Full Stack Engineer',
      company: 'Amazon',
      location: 'Seattle, WA',
      salary: '$140k-$190k',
      type: 'Full-time',
      posted: '3 days ago',
      logo: null,
      applyUrl: 'https://www.amazon.jobs',
      description: 'Work on AWS and e-commerce platforms',
      skills: ['Java', 'Python', 'AWS']
    },
    {
      id: '4',
      title: 'Software Engineering Intern',
      company: 'Microsoft',
      location: 'Redmond, WA',
      salary: '$7k-$9k/month',
      type: 'Internship',
      posted: '1 week ago',
      logo: null,
      applyUrl: 'https://careers.microsoft.com',
      description: 'Summer 2025 internship opportunity',
      skills: ['C#', '.NET', 'Azure']
    },
    {
      id: '5',
      title: 'Backend Engineer',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      salary: '$160k-$210k',
      type: 'Full-time',
      posted: '5 days ago',
      logo: null,
      applyUrl: 'https://jobs.netflix.com',
      description: 'Scale streaming for millions',
      skills: ['Java', 'Microservices', 'Kafka']
    },
    {
      id: '6',
      title: 'DevOps Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      salary: '$145k-$195k',
      type: 'Full-time',
      posted: '4 days ago',
      logo: null,
      applyUrl: 'https://stripe.com/jobs',
      description: 'Build payment infrastructure',
      skills: ['Kubernetes', 'Docker', 'Terraform']
    },
    {
      id: '7',
      title: 'ML Engineer',
      company: 'OpenAI',
      location: 'San Francisco, CA',
      salary: '$180k-$250k',
      type: 'Full-time',
      posted: '2 days ago',
      logo: null,
      applyUrl: 'https://openai.com/careers',
      description: 'Build the future of AI',
      skills: ['Python', 'PyTorch', 'ML']
    },
    {
      id: '8',
      title: 'iOS Developer',
      company: 'Apple',
      location: 'Cupertino, CA',
      salary: '$155k-$205k',
      type: 'Full-time',
      posted: '1 week ago',
      logo: null,
      applyUrl: 'https://www.apple.com/careers',
      description: 'Create amazing iOS experiences',
      skills: ['Swift', 'iOS', 'UIKit']
    },
    {
      id: '9',
      title: 'Data Scientist',
      company: 'Airbnb',
      location: 'San Francisco, CA',
      salary: '$150k-$200k',
      type: 'Full-time',
      posted: '3 days ago',
      logo: null,
      applyUrl: 'https://careers.airbnb.com',
      description: 'Drive data-driven decisions',
      skills: ['Python', 'SQL', 'Statistics']
    },
    {
      id: '10',
      title: 'Remote Full Stack Developer',
      company: 'Shopify',
      location: 'Remote',
      salary: '$120k-$170k',
      type: 'Remote',
      posted: '2 days ago',
      logo: null,
      applyUrl: 'https://www.shopify.com/careers',
      description: 'Build e-commerce solutions',
      skills: ['Ruby', 'React', 'GraphQL']
    },
    {
      id: '11',
      title: 'Security Engineer',
      company: 'Cloudflare',
      location: 'Austin, TX',
      salary: '$140k-$190k',
      type: 'Full-time',
      posted: '1 week ago',
      logo: null,
      applyUrl: 'https://www.cloudflare.com/careers',
      description: 'Protect the internet',
      skills: ['Security', 'Go', 'Networking']
    },
    {
      id: '12',
      title: 'Product Engineer',
      company: 'Vercel',
      location: 'Remote',
      salary: '$130k-$180k',
      type: 'Remote',
      posted: '4 days ago',
      logo: null,
      applyUrl: 'https://vercel.com/careers',
      description: 'Build the web platform',
      skills: ['Next.js', 'React', 'TypeScript']
    }
  ]
}
