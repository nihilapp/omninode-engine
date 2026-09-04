import type { SiteConfig } from '~/types/common.types.ts';
import { linkConfig } from '~/config/link.config.ts';
import { navConfig } from '~/config/nav.config.ts';

export const siteConfig: SiteConfig = {
  site: {
    title: '옴니노드',
    description: '세계관 설정을 구조화하고 연결해 관리·공개하는 지식 아카이브',
    keywords: '옴니노드, 세계관, 설정 문서, 위키, 관계도',
    url: process.env.NODE_ENV === 'production'
      ? 'http://localhost:3000'
      : 'http://localhost:3000',
    type: 'website' as const,
    version: '1.0.0',
    startedYear: 2026,
  },
  author: {
    name: 'NIHILncunia',
    url: 'https://github.com/nihilncunia',
  },
  images: {
    logo: {
      normal: '/images/nihilncunia-logo.svg',
      dark: '/images/nihilncunia-logo-w.svg',
      alt: '옴니노드 로고',
    },
    cover: {
      normal: '/images/nihil-web-logo.png',
      dark: '/images/nihil-web-logo-w.png',
      alt: '옴니노드',
    },
  },
  google: {
    verification: '',
    adSrc: '',
    analyticsId: '',
  },
  api: {
    route: '/api',
  },
  links: linkConfig,
  navigation: navConfig,
} as const;
