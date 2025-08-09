<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- SEO Meta Tags -->
    <Head>
      <Title>TenantX - Smart Property Management Software | Automate Your Rental Business</Title>
      <Meta name="description" content="TenantX is the complete property management solution for landlords. Manage tenants, collect rent, track maintenance, generate invoices, and grow your rental business with our easy-to-use platform." />
      <Meta name="keywords" content="property management software, rental management, landlord software, tenant management, rent collection, property management app, rental property software" />
      <Meta name="author" content="TenantX" />
      <Meta name="robots" content="index, follow" />
      <Meta property="og:title" content="TenantX - Smart Property Management Software" />
      <Meta property="og:description" content="Streamline your rental business with TenantX. Manage properties, tenants, and finances in one powerful platform." />
      <Meta property="og:type" content="website" />
      <Meta property="og:url" content="https://tenantx.com" />
      <Meta property="og:image" content="/og-image.jpg" />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content="TenantX - Smart Property Management Software" />
      <Meta name="twitter:description" content="The complete solution for managing rental properties, tenants, and finances." />
      <Link rel="canonical" href="https://tenantx.com" />
    </Head>

    <!-- Navigation Header -->
    <nav class="relative bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <Icon name="heroicons:home-modern" class="h-8 w-8 text-blue-600 mr-2" />
              <span class="text-2xl font-bold text-gray-900">TenantX</span>
            </div>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
            <a href="#pricing" class="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a>
            <a href="#testimonials" class="text-gray-600 hover:text-blue-600 font-medium transition-colors">Reviews</a>
            <a href="#contact" class="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/login" 
              class="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden sm:block"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/register" 
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              Start Free Trial
            </NuxtLink>
            
            <!-- Mobile Menu Button -->
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2">
              <Icon name="heroicons:bars-3" class="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-100">
          <div class="flex flex-col space-y-4">
            <a href="#features" class="text-gray-600 hover:text-blue-600 font-medium">Features</a>
            <a href="#pricing" class="text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
            <a href="#testimonials" class="text-gray-600 hover:text-blue-600 font-medium">Reviews</a>
            <a href="#contact" class="text-gray-600 hover:text-blue-600 font-medium">Contact</a>
            <NuxtLink to="/login" class="text-gray-600 hover:text-blue-600 font-medium sm:hidden">
              Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Simplify Your 
            <span class="text-blue-600 relative">
              Property Management
              <svg class="absolute -bottom-2 left-0 w-full h-3 text-blue-200" viewBox="0 0 100 12" fill="currentColor">
                <path d="M0,8 Q50,0 100,8 L100,12 L0,12 Z"/>
              </svg>
            </span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete solution for landlords and property managers. Automate rent collection, 
            manage tenants, track maintenance, and grow your rental business with ease.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <NuxtLink 
              to="/register" 
              class="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Free Trial - No Credit Card Required
            </NuxtLink>
            <button 
              @click="scrollToDemo"
              class="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              Watch Demo
            </button>
          </div>

          <!-- Trust Indicators -->
          <div class="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div class="flex items-center">
              <Icon name="heroicons:star-solid" class="h-5 w-5 text-yellow-400 mr-1" />
              <span class="font-semibold">4.9/5</span> from 150+ reviews
            </div>
            <div class="flex items-center">
              <Icon name="heroicons:shield-check" class="h-5 w-5 text-green-500 mr-1" />
              Bank-level security
            </div>
            <div class="flex items-center">
              <Icon name="heroicons:clock" class="h-5 w-5 text-blue-500 mr-1" />
              5-minute setup
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Background Pattern -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
        <svg class="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 120" fill="none">
          <path d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7L1200,64L1200,120L0,120Z" fill="white"/>
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Properties
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            From tenant screening to rent collection, TenantX handles it all so you can focus on growing your business.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature Cards -->
          <div v-for="feature in features" :key="feature.title" class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200">
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-lg bg-blue-100 mr-4">
                <Icon :name="feature.icon" class="h-6 w-6 text-blue-600" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900">{{ feature.title }}</h3>
            </div>
            <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
            <ul class="mt-4 space-y-2">
              <li v-for="item in feature.items" :key="item" class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-3xl sm:text-4xl font-bold text-white mb-2">{{ stat.value }}</div>
            <div class="text-blue-100">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Property Owners Worldwide
          </h2>
          <p class="text-xl text-gray-600">
            See what our customers are saying about TenantX
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="testimonial in testimonials" :key="testimonial.name" class="bg-white rounded-xl p-6 shadow-lg">
            <div class="flex items-center mb-4">
              <div class="flex text-yellow-400">
                <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="h-5 w-5" />
              </div>
            </div>
            <blockquote class="text-gray-600 mb-6 italic">
              "{{ testimonial.quote }}"
            </blockquote>
            <div class="flex items-center">
              <img :src="testimonial.avatar" :alt="testimonial.name" class="w-12 h-12 rounded-full mr-4" />
              <div>
                <div class="font-semibold text-gray-900">{{ testimonial.name }}</div>
                <div class="text-sm text-gray-600">{{ testimonial.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p class="text-xl text-gray-600">
            Start for free, upgrade as you grow
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div v-for="plan in pricingPlans" :key="plan.name" 
               :class="[
                 'rounded-xl p-8 border-2 transition-all hover:shadow-lg',
                 plan.popular 
                   ? 'border-blue-600 bg-blue-50 scale-105 shadow-lg' 
                   : 'border-gray-200 bg-white'
               ]">
            <div v-if="plan.popular" class="text-center">
              <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
            </div>
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
              <div class="mb-4">
                <span class="text-4xl font-bold text-gray-900">${{ plan.price }}</span>
                <span class="text-gray-600">/month</span>
              </div>
              <p class="text-gray-600">{{ plan.description }}</p>
            </div>
            <ul class="space-y-4 mb-8">
              <li v-for="feature in plan.features" :key="feature" class="flex items-center">
                <Icon name="heroicons:check" class="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span class="text-gray-700">{{ feature }}</span>
              </li>
            </ul>
            <NuxtLink 
              to="/register" 
              :class="[
                'block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all',
                plan.popular 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
              ]">
              {{ plan.cta }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Streamline Your Property Management?
        </h2>
        <p class="text-xl text-blue-100 mb-8">
          Join thousands of property owners who trust TenantX to manage their rental business.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/register" 
            class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all inline-flex items-center justify-center"
          >
            Start Your Free Trial
            <Icon name="heroicons:arrow-right" class="ml-2 h-5 w-5" />
          </NuxtLink>
          <a 
            href="mailto:support@tenantx.com" 
            class="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div>
            <div class="flex items-center mb-4">
              <Icon name="heroicons:home-modern" class="h-8 w-8 text-blue-400 mr-2" />
              <span class="text-2xl font-bold">TenantX</span>
            </div>
            <p class="text-gray-400 mb-6">
              The complete property management solution for modern landlords and property managers.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-blue-400 transition-colors">
                <Icon name="simple-icons:facebook" class="h-6 w-6" />
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-400 transition-colors">
                <Icon name="simple-icons:twitter" class="h-6 w-6" />
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-400 transition-colors">
                <Icon name="simple-icons:linkedin" class="h-6 w-6" />
              </a>
            </div>
          </div>

          <!-- Product Links -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Product</h4>
            <ul class="space-y-2">
              <li><a href="#features" class="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" class="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/demo" class="text-gray-400 hover:text-white transition-colors">Demo</a></li>
              <li><a href="/integrations" class="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>

          <!-- Support Links -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Support</h4>
            <ul class="space-y-2">
              <li><a href="/help" class="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/docs" class="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/contact" class="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/status" class="text-gray-400 hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>

          <!-- Company Links -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Company</h4>
            <ul class="space-y-2">
              <li><a href="/about" class="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/blog" class="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="/careers" class="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="/privacy" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {{ currentYear }} TenantX. All rights reserved. Built for property owners, by property owners.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Page Meta for SEO
definePageMeta({
  layout: false // Use custom layout for landing page
})

// Add structured data using useHead
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'TenantX',
        description: 'Complete property management solution for landlords and property managers',
        url: 'https://tenantx.com',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '150'
        }
      })
    }
  ]
})

// Reactive data
const mobileMenuOpen = ref(false)
const currentYear = new Date().getFullYear()

// Features data
const features = [
  {
    icon: 'heroicons:users',
    title: 'Tenant Management',
    description: 'Comprehensive tenant profiles with lease tracking, communication history, and document storage.',
    items: [
      'Digital lease agreements',
      'Tenant screening & background checks',
      'Communication portal',
      'Document management'
    ]
  },
  {
    icon: 'heroicons:credit-card',
    title: 'Rent Collection',
    description: 'Automated rent collection with multiple payment methods and late fee management.',
    items: [
      'Online rent payments',
      'Automatic late fee calculation',
      'Payment history tracking',
      'Multiple payment methods'
    ]
  },
  {
    icon: 'heroicons:wrench-screwdriver',
    title: 'Maintenance Tracking',
    description: 'Streamlined maintenance requests with vendor management and cost tracking.',
    items: [
      'Work order management',
      'Vendor directory',
      'Cost tracking & budgeting',
      'Photo documentation'
    ]
  },
  {
    icon: 'heroicons:document-text',
    title: 'Invoice & Reports',
    description: 'Professional invoicing with comprehensive financial reporting and analytics.',
    items: [
      'Automated invoice generation',
      'Financial reporting',
      'Tax document preparation',
      'Custom report builder'
    ]
  },
  {
    icon: 'heroicons:home',
    title: 'Property Portfolio',
    description: 'Centralized property management with unit details and occupancy tracking.',
    items: [
      'Property & unit management',
      'Occupancy tracking',
      'Lease expiration alerts',
      'Property performance metrics'
    ]
  },
  {
    icon: 'heroicons:chart-bar',
    title: 'Analytics Dashboard',
    description: 'Real-time insights into your rental business performance and growth trends.',
    items: [
      'Revenue analytics',
      'Occupancy rates',
      'Expense tracking',
      'Performance benchmarks'
    ]
  }
]

// Stats data
const stats = [
  { value: '5,000+', label: 'Properties Managed' },
  { value: '15,000+', label: 'Happy Tenants' },
  { value: '$50M+', label: 'Rent Processed' },
  { value: '99.9%', label: 'Uptime' }
]

// Testimonials data
const testimonials = [
  {
    quote: "TenantX has revolutionized how I manage my 50 rental properties. The automation saves me 20 hours per week, and my tenants love the online portal.",
    name: "Sarah Johnson",
    role: "Property Investor",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332446c?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "The maintenance tracking feature alone is worth the subscription. I can now track all repairs, costs, and vendor performance in one place.",
    name: "Mike Chen",
    role: "Real Estate Manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "As a new landlord, TenantX made everything simple. The tenant screening and lease management tools gave me confidence from day one.",
    name: "Emma Rodriguez",
    role: "First-Time Landlord",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  }
]

// Pricing plans data
const pricingPlans = [
  {
    name: 'Starter',
    price: '0',
    description: 'Perfect for new landlords with 1-5 properties',
    popular: false,
    cta: 'Start Free',
    features: [
      'Up to 5 properties',
      'Basic tenant management',
      'Online rent collection',
      'Maintenance requests',
      'Basic reporting',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    price: '29',
    description: 'Ideal for growing portfolios with 6-50 properties',
    popular: true,
    cta: 'Start Free Trial',
    features: [
      'Up to 50 properties',
      'Advanced tenant screening',
      'Automated late fees',
      'Vendor management',
      'Financial analytics',
      'Priority support',
      'Custom branding',
      'API access'
    ]
  },
  {
    name: 'Enterprise',
    price: '99',
    description: 'For large portfolios and property management companies',
    popular: false,
    cta: 'Contact Sales',
    features: [
      'Unlimited properties',
      'Multi-user accounts',
      'White-label solution',
      'Advanced integrations',
      'Custom workflows',
      'Dedicated account manager',
      'On-site training',
      'SLA guarantee'
    ]
  }
]

// Methods
const scrollToDemo = () => {
  // Implement demo scroll or modal
  console.log('Demo clicked')
}

// Close mobile menu when route changes
watch(() => $route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
/* Custom animations and smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hover animations */
.hover-scale {
  transition: transform 0.2s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* Custom shadows */
.shadow-custom {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
