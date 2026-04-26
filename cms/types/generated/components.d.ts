import type { Schema, Struct } from '@strapi/strapi';

export interface AcademicsFacility extends Struct.ComponentSchema {
  collectionName: 'components_academics_facilities';
  info: {
    description: 'Campus facility (lab, library, etc.)';
    displayName: 'Facility';
    icon: 'building';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AcademicsProgram extends Struct.ComponentSchema {
  collectionName: 'components_academics_programs';
  info: {
    description: 'Academic program / level';
    displayName: 'Program';
    icon: 'book';
  };
  attributes: {
    classes: Schema.Attribute.String;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AdmissionsStep extends Struct.ComponentSchema {
  collectionName: 'components_admissions_steps';
  info: {
    description: 'Numbered step in the admissions process';
    displayName: 'Step';
    icon: 'list';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    step: Schema.Attribute.Integer & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_slides';
  info: {
    description: 'A single slide in the home-page hero carousel.';
    displayName: 'Hero Slide';
    icon: 'image';
  };
  attributes: {
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    subheading: Schema.Attribute.Text;
  };
}

export interface HomeStat extends Struct.ComponentSchema {
  collectionName: 'components_home_stats';
  info: {
    description: 'A single stat shown in the homepage stats strip.';
    displayName: 'Stat';
    icon: 'chartLine';
  };
  attributes: {
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_home_testimonials';
  info: {
    description: 'A single testimonial (quote, author, role, photo).';
    displayName: 'Testimonial';
    icon: 'quoteLeft';
  };
  attributes: {
    author: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images'>;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

export interface SharedCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_banners';
  info: {
    description: 'Full-width call-to-action banner with optional side image.';
    displayName: 'CTA Banner';
    icon: 'bullhorn';
  };
  attributes: {
    body: Schema.Attribute.Text;
    buttonHref: Schema.Attribute.String;
    buttonLabel: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedHighlight extends Struct.ComponentSchema {
  collectionName: 'components_shared_highlights';
  info: {
    description: 'Title + body card used in feature lists';
    displayName: 'Highlight';
    icon: 'star';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Per-page SEO metadata';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'academics.facility': AcademicsFacility;
      'academics.program': AcademicsProgram;
      'admissions.step': AdmissionsStep;
      'home.hero-slide': HomeHeroSlide;
      'home.stat': HomeStat;
      'home.testimonial': HomeTestimonial;
      'shared.cta-banner': SharedCtaBanner;
      'shared.highlight': SharedHighlight;
      'shared.seo': SharedSeo;
    }
  }
}
