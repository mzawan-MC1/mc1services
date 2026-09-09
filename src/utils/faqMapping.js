export const faqMap = {
  "What services does MCS Consultancy provide?": "db_faqs.services_provide",
  "Which industries does MCS Consultancy serve?": "db_faqs.industries",
  "Do you build custom software solutions?": "db_faqs.custom_software",
  "How does the development process work?": "db_faqs.development_process",
  "Do you provide long-term maintenance and support?": "db_faqs.maintenance",
  "What makes MCS Consultancy different?": "db_faqs.different",
  "What digital marketing services do you offer?": "db_faqs.digital_marketing",
  "How do I get started?": "contact.faqs.start.q",
  "What is your typical project timeline?": "contact.faqs.timeline.q",
  "Do you offer ongoing support?": "contact.faqs.support.q",
  "What are your payment terms?": "contact.faqs.payment.q"
};

export const faqAnswerMap = {
  "How do I get started?": "contact.faqs.start.a",
  "What is your typical project timeline?": "contact.faqs.timeline.a",
  "Do you offer ongoing support?": "contact.faqs.support.a",
  "What are your payment terms?": "contact.faqs.payment.a"
};

export function getLocalizedFaqQuestion(faq, language, t) {
  if (language === 'ar' && faq.question_ar) {
    return faq.question_ar;
  }
  
  const cleanQuestion = faq.question?.trim();
  const key = faqMap[cleanQuestion];
  
  if (key) {
    return t(key);
  }
  
  return faq.question;
}

export function getLocalizedFaqAnswer(faq, language, t) {
  if (language === 'ar' && faq.answer_ar) {
    return faq.answer_ar;
  }

  const cleanQuestion = faq.question?.trim();
  const key = faqAnswerMap[cleanQuestion];

  if (key) {
    return t(key);
  }

  return faq.answer;
}
