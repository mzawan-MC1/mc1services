import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Phone, Mail, MapPin, Send, CheckCircle, Loader2, MessageCircle, ChevronDown, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import SEOHead from '../components/SEOHead';
import { FaqJsonLd } from '../components/StructuredData';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils';
import { getLocalizedFaqQuestion, getLocalizedFaqAnswer } from '../utils/faqMapping';
import TurnstileWidget from '../components/TurnstileWidget';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const SERVICE_INTEREST_VALUES = new Set([
  'web_development',
  'app_development',
  'custom_software',
  'digital_marketing',
  'automation',
  'production',
  'branding',
  'seo',
  'social_media',
  'it_services',
  'other'
]);

export default function Contact() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service');
  const [selectedService, setSelectedService] = useState(() =>
    SERVICE_INTEREST_VALUES.has(requestedService) ? requestedService : ''
  );
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const formStartedAt = useRef(Date.now());

  const services = [
    { value: 'web_development', label: t('contact.services.web_development', 'Website Development') },
    { value: 'app_development', label: t('contact.services.app_development', 'Mobile App Development') },
    { value: 'custom_software', label: t('contact.services.custom_software', 'Custom Software') },
    { value: 'digital_marketing', label: t('contact.services.digital_marketing', 'Digital Marketing') },
    { value: 'automation', label: t('contact.services.automation', 'Business Automation') },
    { value: 'production', label: t('contact.services.production', 'Production & Creative Services') },
    { value: 'branding', label: t('contact.services.branding', 'Branding & Design') },
    { value: 'seo', label: t('contact.services.seo', 'SEO & SEM') },
    { value: 'social_media', label: t('contact.services.social_media', 'Social Media Marketing') },
    { value: 'it_services', label: t('contact.services.it_services', 'IT Services & Consulting') },
    { value: 'other', label: t('contact.services.other', 'Other') }
  ];

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      service_interest: selectedService,
      message: '',
      website: ''
    }
  });

  useEffect(() => {
    if (SERVICE_INTEREST_VALUES.has(requestedService)) {
      setSelectedService(requestedService);
      setValue('service_interest', requestedService, { shouldDirty: false });
    }
  }, [requestedService, setValue]);

  const { data: contactContent = {} } = useQuery({
    queryKey: ['contact-content'],
    queryFn: async () => {
      // Corrected call to use contactContent property instead of pageContent
      const sections = await dataLayer.contactContent.getAll(); 
      const content = {};
      sections.forEach(s => {
        content[s.section_key] = s;
      });
      return content;
    }
  });

  const { data: siteSettings = [] } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => dataLayer.siteSettings.getAll()
  });

  const getSetting = (key) => siteSettings.find(s => s.setting_key === key)?.setting_value || '';

  const { data: faqs = [] } = useQuery({
    queryKey: ['contact-faqs'],
    queryFn: () => dataLayer.faqs.getByCategory('general')
  });

  const defaultFaqs = [
    { question: t('contact.faqs.start.q', 'How do I get started?'), answer: t('contact.faqs.start.a', 'Simply fill out our contact form or schedule a consultation call. We\'ll discuss your project requirements and provide a custom proposal.') },
    { question: t('contact.faqs.timeline.q', 'What is your typical project timeline?'), answer: t('contact.faqs.timeline.a', 'The timeline depends on scope, integrations, content readiness and review requirements. We will agree a realistic schedule after understanding the project.') },
    { question: t('contact.faqs.support.q', 'Do you offer ongoing support?'), answer: t('contact.faqs.support.a', 'Yes! We offer various maintenance and support packages to keep your digital assets running smoothly after launch.') },
    { question: t('contact.faqs.payment.q', 'What are your payment terms?'), answer: t('contact.faqs.payment.a', 'Payment terms are agreed in the proposal and can be structured around suitable project milestones.') }
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        company: data.company?.trim() || null,
        service_interest: data.service_interest,
        message: data.message.trim(),
        status: 'new',
        subject: `New Inquiry: ${data.service_interest || 'General'}`
      };

      return await dataLayer.contactSubmissions.submitPublic(payload, data.turnstileToken);
    },
    onSuccess: () => {
      setSubmitted(true);
      reset();
      setSelectedService('');
      toast.success(t('contact.message_received', 'Message sent successfully!'));
    },
    onError: () => {
      console.error('Contact form submission failed');
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
      toast.error(t('common.error', 'Failed to send message. Please try again.'));
    }
  });

  const onSubmit = (data) => {
    if (data.website || Date.now() - formStartedAt.current < 2500) {
      toast.error(t('common.error', 'Failed to send message. Please try again.'));
      return;
    }
    if (!turnstileToken) {
      toast.error('Please complete the security verification.');
      return;
    }
    submitMutation.mutate({ ...data, turnstileToken });
  };

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  return (
    <div>
      <SEOHead pageIdentifier="contact" />
      <FaqJsonLd faqs={displayFaqs} />
      {/* Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-blue-300 text-sm font-medium mb-6">
              {getLoc(contactContent.hero, 'subtitle') || t('contact.get_in_touch_hero', 'Get In Touch')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {getLoc(contactContent.hero, 'title') || t('contact.lets_build_amazing', "Let's Build Something Amazing Together")}
            </h1>
            <p className="text-xl text-slate-300">
              {getLoc(contactContent.hero, 'content') || t('contact.ready_to_start', 'Ready to start your project? Send us the details and we will discuss the right next step.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {getLoc(contactContent.info, 'title') || t('contact.contact_info', 'Contact Information')}
              </h2>
              <p className="text-slate-600 mb-8">
                {getLoc(contactContent.info, 'subtitle') || t('contact.have_project', "Have a project in mind? Let's discuss how we can help bring your vision to life.")}
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t('footer.call_us', 'Phone')}</p>
                    <a href={`tel:${getSetting('contact_phone') || contactContent.info?.phone || '+971508322799'}`} className="text-slate-600 hover:text-blue-600" dir="ltr">
                      {getSetting('contact_phone') || contactContent.info?.phone || '+971-50-83-22799'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t('footer.email_us', 'Email')}</p>
                    <a href={`mailto:${getSetting('contact_email_primary') || contactContent.info?.email || 'info@mc1services.com'}`} className="text-slate-600 hover:text-blue-600 block">
                      {getSetting('contact_email_primary') || contactContent.info?.email || 'info@mc1services.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t('footer.visit_us', 'Address')}</p>
                    <p className="text-slate-600 whitespace-pre-line">
                      {getSetting('contact_address') || contactContent.info?.address || 'Industrial Area 2\nSharjah, UAE'}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/971522405566" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-medium transition"
              >
                <MessageCircle className="w-5 h-5" />
                {t('contact.chat_whatsapp', 'Chat on WhatsApp')}
              </a>

              {/* Map */}
              {(() => {
                const mapUrl = getSetting('contact_map_url') || contactContent.info?.map_embed_url || '';
                return mapUrl.trim() ? (
                  <div className="mt-8 rounded-xl overflow-hidden bg-slate-200" style={{ minHeight: '350px', height: '350px' }}>
                    <iframe
                      src={mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location Map"
                    />
                  </div>
                ) : (
                  <div className="mt-8 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ minHeight: '350px', height: '350px' }}>
                    <div className="text-center p-6">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-sm text-slate-600 font-medium">{t('contact.map_not_configured')}</p>
                      <p className="text-xs text-slate-400 mt-1">{t('contact.map_admin_hint')}</p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              {submitted ? (
                <div className="bg-green-50 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{t('contact.thank_you', 'Thank You!')}</h3>
                  <p className="text-slate-600">{t('contact.message_received', "We've received your message. A member of our team will review it and respond as soon as possible.")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                  <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
                    <Label htmlFor="website">{t('contact.website')}</Label>
                    <Input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {getLoc(contactContent.form, 'title') || t('contact.send_message_title', 'Send Us a Message')}
                  </h2>
                  <p className="text-slate-600 mb-6">
                    {t('contact.form_intro', 'Choose the closest service and briefly describe the outcome you need.')}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">{t('contact.full_name', 'Full Name')} *</Label>
                      <Input 
                        id="name" 
                        {...register('name', { 
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' },
                          maxLength: { value: 120, message: 'Name must be 120 characters or fewer' }
                        })} 
                        maxLength={120}
                        className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder={t('contact.full_name', "John Doe")}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">{t('contact.email_address', 'Email Address')} *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })} 
                        maxLength={254}
                        className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="john@example.com" 
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('contact.phone_number', 'Phone Number')}</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        {...register('phone', {
                          pattern: {
                            value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                            message: 'Invalid phone number'
                          }
                        })} 
                        maxLength={40}
                        className={`mt-2 ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="+971 50 123 4567"
                        dir="ltr"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="company">{t('contact.company_name', 'Company Name')}</Label>
                      <Input 
                        id="company" 
                        {...register('company', { maxLength: { value: 160, message: 'Company must be 160 characters or fewer' } })} 
                        maxLength={160}
                        className="mt-2" 
                        placeholder={t('contact.company_name', "Your Company")}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="service">{t('contact.service_interest', 'What service are you interested in?')}</Label>
                      <Select
                        value={selectedService}
                        onValueChange={(value) => {
                          setSelectedService(value);
                          setValue('service_interest', value, { shouldDirty: true });
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('common.view_all', "Select a service")} />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="message">{t('contact.tell_us_about_project', 'Tell us about your project')} *</Label>
                      <Textarea 
                        id="message" 
                        {...register('message', { 
                          required: 'Message is required',
                          minLength: { value: 10, message: 'Message must be at least 10 characters' },
                          maxLength: { value: 5000, message: 'Message must be 5000 characters or fewer' }
                        })} 
                        maxLength={5000}
                        className={`mt-2 min-h-[150px] ${errors.message ? 'border-red-500' : ''}`}
                        placeholder={t('contact.tell_us_about_project', "Describe your project, goals, and any specific requirements...")}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <TurnstileWidget
                      siteKey={TURNSTILE_SITE_KEY}
                      onVerify={setTurnstileToken}
                      resetKey={turnstileResetKey}
                    />
                  </div>
                  <Button type="submit" disabled={submitMutation.isPending || !turnstileToken} className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full">
                    {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{getLoc(contactContent.form, 'button_text') || contactContent.form?.button_text || t('common.send_message', 'Send Message')}</>}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('contact.faq_title', 'Frequently Asked Questions')}</h2>
          </motion.div>

          <div className="space-y-4">
            {displayFaqs.map((faq, i) => (
              <motion.div
                key={faq.id || faq.question || i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-slate-900">{getLocalizedFaqQuestion(faq, i18n.language, t)}</span>
                  <ChevronDown aria-hidden="true" className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div id={`faq-answer-${i}`} className="px-5 pb-5 text-slate-600">{getLocalizedFaqAnswer(faq, i18n.language, t)}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
