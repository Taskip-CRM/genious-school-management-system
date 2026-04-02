import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Genius SMS',
  description: 'Comprehensive School Management System Documentation',
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
  ],

  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo-dark.svg', alt: 'Genius SMS' },

    nav: [
      { text: 'Guide', link: '/installation' },
      { text: 'Modules', link: '/modules/' },
      { text: 'API', link: '/api' },
      {
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Installation', link: '/installation' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'User Roles', link: '/roles' },
        ],
      },
      {
        text: 'Modules',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/modules/' },
          { text: 'Authentication', link: '/modules/authentication' },
          { text: 'School Setup', link: '/modules/school-setup' },
          { text: 'Students', link: '/modules/students' },
          { text: 'Staff & HR', link: '/modules/staff-hr' },
          { text: 'Attendance', link: '/modules/attendance' },
          { text: 'Timetable', link: '/modules/timetable' },
          { text: 'Examinations', link: '/modules/examinations' },
          { text: 'Fee Management', link: '/modules/fees' },
          { text: 'Library', link: '/modules/library' },
          { text: 'Transport', link: '/modules/transport' },
          { text: 'Hostel', link: '/modules/hostel' },
          { text: 'Homework & Learning', link: '/modules/homework' },
          { text: 'Communication', link: '/modules/communication' },
          { text: 'Reports & Analytics', link: '/modules/reports' },
          { text: 'System Administration', link: '/modules/system-admin' },
          { text: 'Subscriptions', link: '/modules/subscriptions' },
          { text: 'Student Portal', link: '/modules/student-portal' },
          { text: 'Parent Portal', link: '/modules/parent-portal' },
          { text: 'Admissions', link: '/modules/admissions' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Reference', link: '/api' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Deployment', link: '/deployment' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xgenious/genius-sms' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 xgenious',
    },

    editLink: {
      pattern: 'https://github.com/xgenious/genius-sms/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'medium',
      },
    },
  },
})
