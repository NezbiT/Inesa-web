export type SocialNetwork = 'instagram' | 'facebook'

export interface SocialLink {
  id: SocialNetwork
  url: string
  labelKey: `social.${SocialNetwork}`
}

export const socialLinks: SocialLink[] = [
  {
    id: 'instagram',
    url: 'https://www.instagram.com/inesa_institute/',
    labelKey: 'social.instagram',
  },
  {
    id: 'facebook',
    url: 'https://www.facebook.com/p/Inesa-Institute-61566629233696/',
    labelKey: 'social.facebook',
  },
]