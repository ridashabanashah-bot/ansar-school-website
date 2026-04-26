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
      'shared.highlight': SharedHighlight;
      'shared.seo': SharedSeo;
    }
  }
}
