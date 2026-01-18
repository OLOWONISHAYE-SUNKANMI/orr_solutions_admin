// This script will help identify all the remaining fields that need to be updated
// Search for: value={content?.
// Replace with: value={getStringValue(content?.
// And remove the || '' part

const fieldsToUpdate = [
  'content?.businessSystemSection?.card_2_description',
  'content?.businessSystemSection?.card_3_title',
  'content?.businessSystemSection?.card_3_description',
  'content?.orrRoleSection?.title',
  'content?.orrRoleSection?.description',
  'content?.messageStrip?.title',
  'content?.messageStrip?.message',
  'content?.processSection?.title',
  'content?.processSection?.subtitle',
  'content?.orrReportSection?.title',
  'content?.orrReportSection?.subtitle',
  'content?.orrReportSection?.feature_1',
  'content?.orrReportSection?.feature_2',
  'content?.orrReportSection?.feature_3',
  'content?.orrReportSection?.feature_4',
  'content?.servicesPage?.hero_title',
  'content?.servicesPage?.hero_subtitle',
  'content?.servicesPage?.pillars_title',
  'content?.servicesPage?.pillar_1_title',
  'content?.servicesPage?.pillar_1_description',
  'content?.servicesPage?.pillar_2_title',
  'content?.servicesPage?.pillar_2_description',
  'content?.servicesPage?.pillar_3_title',
  'content?.servicesPage?.pillar_3_description',
  'content?.servicesPage?.services_overview_title',
  'content?.servicesPage?.service_1_title',
  'content?.servicesPage?.service_1_description',
  'content?.servicesPage?.service_2_title',
  'content?.servicesPage?.service_2_description',
  'content?.servicesPage?.business_gp_title',
  'content?.servicesPage?.business_gp_subtitle',
  'content?.servicesPage?.business_gp_description',
  'content?.servicesPage?.data_intelligence_title',
  'content?.servicesPage?.data_intelligence_description'
];

console.log('Fields that need getStringValue wrapper:', fieldsToUpdate.length);