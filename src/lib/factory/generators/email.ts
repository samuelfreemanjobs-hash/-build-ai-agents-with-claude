import type { BusinessProfile, EmailSequence } from "../types";
import { BUSINESS_TYPE_TEMPLATES } from "../templates/business-types";

export function generateEmailSequences(profile: BusinessProfile): EmailSequence[] {
  const template = BUSINESS_TYPE_TEMPLATES[profile.businessType];

  return [
    {
      name: "New Lead Nurture Sequence",
      purpose: "Convert website inquiries into qualified sales meetings",
      emails: [
        {
          day: 0,
          subject: `Welcome to ${profile.companyName} — Your Logistics Partner`,
          preview: "Here's what happens next...",
          bodyOutline: `Thank them for reaching out. Introduce ${profile.companyName} and core services (${profile.services.slice(0, 3).join(", ")}). Include 1-2 client success metrics. CTA: Schedule a 15-min discovery call.`,
          cta: "Book Your Discovery Call",
        },
        {
          day: 2,
          subject: `How ${template.buyerPersonas[0]}s Solve ${template.painPoints[0]}`,
          preview: "A proven approach to logistics challenges",
          bodyOutline: `Educational content addressing ${template.painPoints[0]}. Share a brief case study or data point. Position ${profile.differentiators[0] || template.competitiveAdvantages[0]} as the solution. CTA: Download related guide.`,
          cta: "Download the Guide",
        },
        {
          day: 5,
          subject: `3 Questions Every ${template.buyerPersonas[0]} Should Ask Their Logistics Provider`,
          preview: "Make sure you're getting the best value",
          bodyOutline: `Provide 3 qualifying questions that highlight your strengths. Subtly differentiate from competitors. Include social proof (testimonial snippet). CTA: Get a custom quote.`,
          cta: "Get Your Custom Quote",
        },
        {
          day: 8,
          subject: `See How [Client Type] Saved 23% on ${template.name}`,
          preview: "Real results from a company like yours",
          bodyOutline: `Case study format: Challenge → Solution → Results. Use specific metrics. Relate to their industry (${profile.targetMarket.replace(/-/g, " ")}). CTA: Schedule strategy session.`,
          cta: "Schedule a Strategy Session",
        },
        {
          day: 14,
          subject: `Still exploring ${template.name.toLowerCase()} options?`,
          preview: "We're here when you're ready",
          bodyOutline: `Soft follow-up. Recap value proposition. Offer multiple engagement options (call, email, visit). Include FAQ link. CTA: Reply to this email.`,
          cta: "Reply to Connect",
        },
      ],
    },
    {
      name: "Customer Onboarding Sequence",
      purpose: "Ensure smooth onboarding and set expectations for new clients",
      emails: [
        {
          day: 0,
          subject: `Welcome aboard, ${profile.companyName} client!`,
          preview: "Your onboarding journey starts here",
          bodyOutline: `Welcome message. Introduce account manager. Outline onboarding timeline (Week 1: setup, Week 2: first shipment, Week 3: optimization review). CTA: Complete onboarding form.`,
          cta: "Complete Onboarding Form",
        },
        {
          day: 3,
          subject: "Your account setup is complete — here's what's next",
          preview: "Everything is ready for your first shipment",
          bodyOutline: `Confirm account activation. Share portal login credentials. Explain how to book/track shipments. CTA: Log into client portal.`,
          cta: "Access Client Portal",
        },
        {
          day: 14,
          subject: "Your first two weeks — a quick check-in",
          preview: "How are things going?",
          bodyOutline: `Request feedback on initial experience. Share tips for maximizing value. Offer optimization consultation. CTA: Book 30-min review call.`,
          cta: "Book Your Review Call",
        },
        {
          day: 30,
          subject: "30-day performance report + optimization recommendations",
          preview: "Your first month by the numbers",
          bodyOutline: `Share performance metrics (on-time %, cost savings, volume). Provide 2-3 optimization recommendations. Introduce upsell opportunities. CTA: Discuss growth plan.`,
          cta: "Plan Your Growth",
        },
      ],
    },
    {
      name: "Re-engagement / Win-back Sequence",
      purpose: "Reactivate dormant leads and former clients",
      emails: [
        {
          day: 0,
          subject: "We've made some exciting changes at " + profile.companyName,
          preview: "New capabilities you should know about",
          bodyOutline: `Announce new services or capabilities. Share recent company milestones. Remind them of your relationship. CTA: See what's new.`,
          cta: "Explore New Services",
        },
        {
          day: 5,
          subject: `Special offer: Free ${template.name.toLowerCase()} assessment`,
          preview: "Limited-time opportunity for returning clients",
          bodyOutline: `Offer complimentary logistics audit or assessment. Create urgency with expiration date. Highlight ROI potential. CTA: Claim your free assessment.`,
          cta: "Claim Free Assessment",
        },
      ],
    },
  ];
}
