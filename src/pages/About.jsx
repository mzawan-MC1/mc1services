import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, getLocalizedValue } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Target, Eye, Heart, Users, Award, Briefcase, Linkedin, Twitter, ArrowRight, Instagram, Facebook, Link as LinkIcon } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

const SocialIcon = ({ url }) => {
  if (!url) return null;
  
  const lowerUrl = url.toLowerCase();
  let Icon = LinkIcon;
  
  if (lowerUrl.includes('linkedin.com')) Icon = Linkedin;
  else if (lowerUrl.includes('instagram.com')) Icon = Instagram;
  else if (lowerUrl.includes('facebook.com')) Icon = Facebook;
  else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) Icon = Twitter;
  else if (lowerUrl.includes('snapchat.com')) Icon = LinkIcon;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
};

export default function About() {
  const { t, i18n } = useTranslation();
  
  const values = [
    {
      icon: Target,
      title: t('about.excellence', 'Excellence'),
      description: t('about.excellence_desc', 'We strive for excellence in every project, delivering solutions that exceed expectations.')
    },
    {
      icon: Eye,
      title: t('about.innovation', 'Innovation'),
      description: t('about.innovation_desc', 'We embrace new technologies and creative approaches to solve complex challenges.')
    },
    {
      icon: Heart,
      title: t('about.integrity', 'Integrity'),
      description: t('about.integrity_desc', 'We build lasting relationships through transparency, honesty, and ethical practices.')
    },
    {
      icon: Users,
      title: t('about.collaboration', 'Collaboration'),
      description: t('about.collaboration_desc', 'We work closely with our clients as true partners, ensuring their vision comes to life.')
    }
  ];

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => dataLayer.team.getAll()
  });

  const { data: aboutContent = {} } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const sections = await dataLayer.aboutContent.getAll();
      const content = {};
      sections.forEach(s => {
        content[s.section_key] = s;
      });
      return content;
    }
  });

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  return (
    <div>
      <SEOHead pageIdentifier="about" />
      {/* Hero Section */}
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
              {getLoc(aboutContent.hero, 'subtitle') || t('about.about_subtitle', 'About MCS Consultancy')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {getLoc(aboutContent.hero, 'title') || t('about.about_title', 'Driving Digital Transformation')}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              {getLoc(aboutContent.hero, 'content') || t('about.about_desc', "We're a team of passionate technologists, creatives, and strategists dedicated to helping businesses thrive in the digital age.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6">
                {getLoc(aboutContent.intro, 'subtitle') || t('about.our_story', 'Our Story')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                {getLoc(aboutContent.intro, 'title') || t('about.built_on_innovation', 'Built on a Foundation of Innovation')}
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed whitespace-pre-line">
                {getLoc(aboutContent.intro, 'content') || t('about.our_story_content', `Founded with a vision to bridge the gap between technology and business success, MCS Consultancy has grown from a small team of developers into a full-service digital agency serving clients worldwide.

Over the years, we've expanded our expertise to encompass web and app development, digital marketing, production services, and comprehensive IT solutions. Our multidisciplinary approach allows us to deliver integrated solutions that drive real business results.

Today, we're proud to be trusted partners for businesses of all sizes, from ambitious startups to established enterprises. Our commitment to quality, innovation, and client success remains at the heart of everything we do.`)}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-20" />
              <img
                src={aboutContent.intro?.image_url || "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800"}
                alt="Our office"
                className="relative rounded-3xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={getLoc(aboutContent.values, 'subtitle') || t('about.our_values', "Our Values")}
            title={getLoc(aboutContent.values, 'title') || t('about.what_drives_us', "What Drives Us")}
            description={getLoc(aboutContent.values, 'content') || t('about.values_desc', "Our core values shape every decision we make and every project we undertake.")}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10+', label: t('about.years_experience', 'Years of Experience') },
              { value: '150+', label: t('about.projects_delivered', 'Projects Delivered') },
              { value: '50+', label: t('about.happy_clients', 'Happy Clients') },
              { value: '25+', label: t('about.team_members', 'Team Members') }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label={getLoc(aboutContent.team_intro, 'subtitle') || t('about.our_team', "Our Team")}
              title={getLoc(aboutContent.team_intro, 'title') || t('about.meet_experts', "Meet the Experts")}
              description={getLoc(aboutContent.team_intro, 'content') || t('about.team_desc', "A talented team of professionals dedicated to bringing your vision to life.")}
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={getLoc(member, 'name')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-6xl font-bold text-white/50">{getLoc(member, 'name')?.[0]}</span>
                      </div>
                    )}
                    {(member.linkedin_url || member.twitter_url) && (
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        {member.linkedin_url && (
                          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition">
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {member.twitter_url && (
                          <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition">
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{getLoc(member, 'name')}</h3>
                        <p className="text-blue-600 font-medium">{getLoc(member, 'role')}</p>
                      </div>
                      {member.profile_url && <SocialIcon url={member.profile_url} />}
                    </div>
                    <p className="text-slate-600 mt-3 text-sm leading-relaxed">{getLoc(member, 'bio')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {t('about.ready_to_work', 'Ready to Work With Us?')}
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              {t('about.lets_discuss_vision', "Let's discuss how we can help bring your vision to life.")}
            </p>
            <Link
              to={createPageUrl('Contact')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              {t('about.get_in_touch', 'Get In Touch')}
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
