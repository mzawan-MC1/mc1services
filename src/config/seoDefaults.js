const SITE_NAME = 'MCS Consultancy';

const PAGE_DEFAULTS = {
  home: {
    title: `${SITE_NAME} | Digital Solutions for UAE Businesses`,
    description: 'Websites, custom software, automation, digital marketing, production and IT services for businesses in the UAE.',
    titleAr: `${SITE_NAME} | حلول رقمية للشركات في الإمارات`,
    descriptionAr: 'تطوير المواقع والبرمجيات والأتمتة والتسويق الرقمي والإنتاج وخدمات تقنية المعلومات للشركات في الإمارات.'
  },
  about: {
    title: `About Us | ${SITE_NAME}`,
    description: 'Learn about MCS Consultancy and our practical approach to technology, marketing and business support in the UAE.',
    titleAr: `من نحن | ${SITE_NAME}`,
    descriptionAr: 'تعرف على إم سي إس للاستشارات ونهجنا العملي في التقنية والتسويق ودعم الأعمال في الإمارات.'
  },
  contact: {
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Tell MCS Consultancy about your project, business challenge or support requirement.',
    titleAr: `اتصل بنا | ${SITE_NAME}`,
    descriptionAr: 'أخبر إم سي إس للاستشارات عن مشروعك أو تحديات عملك أو احتياجات الدعم.'
  },
  portfolio: {
    title: `Portfolio | ${SITE_NAME}`,
    description: 'Explore selected technology, marketing and creative projects published by MCS Consultancy.',
    titleAr: `أعمالنا | ${SITE_NAME}`,
    descriptionAr: 'استعرض مجموعة مختارة من مشاريع التقنية والتسويق والإبداع المنشورة من إم سي إس للاستشارات.'
  },
  tools: {
    title: `Free UAE Business and Everyday Tools | ${SITE_NAME}`,
    description: 'Use practical online calculators and utilities for UAE residents, visitors, marketers and businesses.',
    titleAr: `أدوات مجانية للأعمال والحياة في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'استخدم حاسبات وأدوات عملية عبر الإنترنت للمقيمين والزوار والمسوقين والشركات في الإمارات.'
  },
  'web-development': {
    title: `Web Development Services UAE | ${SITE_NAME}`,
    description: 'Business websites and web applications designed around your goals, users and operational requirements.',
    titleAr: `خدمات تطوير المواقع في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'مواقع وتطبيقات ويب مصممة حول أهداف عملك ومستخدميك واحتياجاتك التشغيلية.'
  },
  'app-development': {
    title: `Mobile App Development UAE | ${SITE_NAME}`,
    description: 'Mobile application planning, design and development for businesses in the UAE.',
    titleAr: `تطوير تطبيقات الجوال في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'تخطيط وتصميم وتطوير تطبيقات الجوال للشركات في الإمارات.'
  },
  'digital-marketing': {
    title: `Digital Marketing Services UAE | ${SITE_NAME}`,
    description: 'Practical digital marketing support aligned with your audience, offer and business priorities.',
    titleAr: `خدمات التسويق الرقمي في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'دعم عملي للتسويق الرقمي يتوافق مع جمهورك وعروضك وأولويات عملك.'
  },
  automation: {
    title: `Business Automation Services UAE | ${SITE_NAME}`,
    description: 'Streamline repetitive workflows and connect business processes with practical automation.',
    titleAr: `خدمات أتمتة الأعمال في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'بسّط سير العمل المتكرر واربط عمليات الأعمال باستخدام أتمتة عملية.'
  },
  production: {
    title: `Creative Production Services UAE | ${SITE_NAME}`,
    description: 'Video, photography and creative production support for business communication and campaigns.',
    titleAr: `خدمات الإنتاج الإبداعي في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'دعم إنتاج الفيديو والتصوير والمحتوى الإبداعي لاتصالات الأعمال والحملات.'
  },
  'it-services': {
    title: `IT Services and Support UAE | ${SITE_NAME}`,
    description: 'IT consulting, infrastructure, cloud, security and support services matched to business needs.',
    titleAr: `خدمات ودعم تقنية المعلومات في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'استشارات وبنية تحتية وسحابة وأمن ودعم تقني يتناسب مع احتياجات الأعمال.'
  },
  'development-services': {
    title: `Software Development Services UAE | ${SITE_NAME}`,
    description: 'Custom software, websites and applications planned and delivered around real business requirements.',
    titleAr: `خدمات تطوير البرمجيات في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'برمجيات ومواقع وتطبيقات مخصصة يتم تخطيطها وتنفيذها حول احتياجات العمل الفعلية.'
  },
  'marketing-services': {
    title: `Marketing Services UAE | ${SITE_NAME}`,
    description: 'Marketing planning, content and campaign support shaped around your business and audience.',
    titleAr: `خدمات التسويق في الإمارات | ${SITE_NAME}`,
    descriptionAr: 'تخطيط تسويقي ومحتوى ودعم للحملات مصمم حول عملك وجمهورك.'
  },
  'privacy-policy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'Read the MCS Consultancy privacy policy.',
    titleAr: `سياسة الخصوصية | ${SITE_NAME}`,
    descriptionAr: 'اقرأ سياسة الخصوصية الخاصة بإم سي إس للاستشارات.'
  },
  'terms-of-service': {
    title: `Terms of Service | ${SITE_NAME}`,
    description: 'Read the MCS Consultancy terms of service.',
    titleAr: `شروط الخدمة | ${SITE_NAME}`,
    descriptionAr: 'اقرأ شروط الخدمة الخاصة بإم سي إس للاستشارات.'
  }
};

const GENERIC_DEFAULT = {
  title: `${SITE_NAME} | Technology and Business Solutions UAE`,
  description: 'Practical technology, marketing and business support for organisations in the UAE.',
  titleAr: `${SITE_NAME} | حلول التقنية والأعمال في الإمارات`,
  descriptionAr: 'دعم عملي في التقنية والتسويق والأعمال للمؤسسات في الإمارات.'
};

export function getSeoDefaults(pageIdentifier) {
  return PAGE_DEFAULTS[pageIdentifier] || GENERIC_DEFAULT;
}