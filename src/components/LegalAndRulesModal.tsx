import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, BookOpen, AlertCircle, CheckCircle2, Scale, Truck, Phone, Mail } from 'lucide-react';

export type LegalTab = 'rules' | 'privacy' | 'terms';

interface LegalAndRulesModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalAndRulesModal: React.FC<LegalAndRulesModalProps> = ({
  isOpen,
  initialTab = 'rules',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-white/[0.12] bg-[#0A0D14]/95 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.09] bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-[#FACC15]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Jason LTL Freight Governance &amp; Policies
              </h2>
              <p className="text-[11px] text-slate-400">
                Official freight rules, operating regulations, privacy policy, and carriage terms
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/[0.08] px-6 bg-black/30 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'border-[#FACC15] text-[#FACC15] bg-yellow-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rules &amp; Regulations (10 Core Mandates)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#FACC15] text-[#FACC15] bg-yellow-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy &amp; Data Security Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#FACC15] text-[#FACC15] bg-yellow-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Carriage &amp; Tariffs</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* TAB 1: RULES & REGULATIONS */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/25 text-yellow-200 text-xs">
                <strong>Mandatory Carrier Tariff Compliance Notice:</strong> All freight shipments booked through Jason LTL are subject to National Motor Freight Traffic Association (NMFTA) guidelines, carrier individual tariff circulars, and federal DOT transportation laws.
              </div>

              {/* 10 Detailed Freight Rules */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 1:</span>
                    <span>Total Weight Declaration &amp; Weigh/Inspection (W&amp;I) Audits</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    The weight entered during quotation must represent the <strong>TOTAL combined gross shipment weight</strong> of all line items, including packaging, skids, crates, and pallets. The system does not multiply units by weight. Certified carrier terminal scales systematically re-weigh shipments; discrepancies will be adjusted based on certified certified scale tickets.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 2:</span>
                    <span>NMFC Freight Classification &amp; Density Standards</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Freight class must be determined according to official NMFC density matrices (pounds per cubic foot) and commodity packaging codes. Entering an inaccurate or lower class to artificially reduce tariff costs will result in automatic carrier re-classification fees and retroactive billing adjustments.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 3:</span>
                    <span>Packaging, Skid &amp; Palletization Integrity</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    All freight must be properly packaged, palletized on standard 4-way entry wood/plastic pallets, securely shrink-wrapped with minimum 60-gauge stretch film, and banded if necessary. Loose, unpalletized cartons, protruding overhangs greater than 2 inches, and unstable pyramid stacking are strictly prohibited by carrier pickup drivers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 4:</span>
                    <span>Mandatory Declaration of Accessorial Equipment</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Facilities lacking commercial standard loading docks or forklifts must select <strong>Liftgate Service</strong>. Non-commercial locations (residences, apartments, churches, storage units, farms, schools, and military bases) require <strong>Residential / Limited Access</strong> selection. Failure to pre-book necessary accessorials will result in redelivery fees and delay charges.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 5:</span>
                    <span>Official Bill of Lading (BOL) Execution</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Shippers must present the official Jason LTL generated Bill of Lading (BOL) to the driver at the time of pickup. The driver must sign and date the shipper copy. If shipper hands a generic BOL to the driver, or allows the driver to create a manual BOL without Jason LTL billing instructions, discounted rates are void and carrier standard nondiscounted class tariff rates will apply.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 6:</span>
                    <span>Carrier Standard Liability vs. Full Value Insurance</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Standard carrier liability in LTL transport is governed by individual carrier tariff liability schedules and is typically capped between <strong>$0.50 and $25.00 per pound</strong> based on commodity class and new vs. used status. To ensure 100% financial reimbursement against physical loss or damage, shippers must select <strong>&quot;Book W/ Full Insurance&quot;</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 7:</span>
                    <span>Loading/Unloading Free Time &amp; Detention Tariffs</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    LTL drivers allow up to <strong>30 minutes of standard free time</strong> for loading or unloading. If loading or unloading exceeds 30 minutes due to shipper or consignee dock delays, carrier detention charges apply at standard tariff rates (typically $75 - $150 per hour billed in 15-minute increments).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 8:</span>
                    <span>HazMat Certification &amp; Prohibited Commodities</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Hazardous materials (HazMat) must be explicitly flagged during quotation and must comply with 49 CFR DOT regulations. All hazardous placards, UN numbers, packaging group certifications, and 24/7 emergency response phone numbers (Chemtrec/Infotrac) must be supplied. Strict prohibition applies to firearms, explosives, live animals, unapproved lithium batteries, and illegal narcotics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 9:</span>
                    <span>Reconsignment, Redelivery &amp; Storage</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    If delivery address must be changed after shipment has been picked up, a written Reconsignment Authorization must be submitted to Jason LTL dispatch. Reconsignment fees, cross-dock handling, and additional mileage charges will be assessed according to the delivering carrier&apos;s governing rules circular.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <span className="text-[#FACC15] font-mono">Rule 10:</span>
                    <span>Zero Double Brokering &amp; Direct Carrier Dispatch</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    In compliance with 49 U.S.C. &sect; 14916 and federal motor carrier safety standards, Jason LTL enforces strict direct carrier execution. Loads are dispatched exclusively to vetted, FMCSA-registered national and regional motor freight carriers with active operating authority and verified safety ratings. No secondary re-brokering is permitted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & DATA SECURITY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-200 text-xs">
                <strong>Privacy Commitment:</strong> Jason LTL and CYL Ltd. respect your operational privacy. We do not sell, monetize, or disclose your corporate shipping data or supplier identities to external marketing firms.
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">1. Information We Collect</h3>
                  <p className="text-slate-400 text-xs">
                    To deliver accurate freight rate calculations and execute transport bookings, we collect:
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400 text-xs">
                    <li>Shipper &amp; Consignee physical addresses, facility types, postal/ZIP codes, and access limitations</li>
                    <li>Contact names, phone numbers, and operational dispatch email addresses</li>
                    <li>Cargo commodity descriptions, packaging types, weights, dimensions, and declared commercial values</li>
                    <li>IP address, browser user-agent, and transactional timestamps for rate-limiting security and fraud prevention</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">2. How Your Information Is Used</h3>
                  <p className="text-slate-400 text-xs">
                    Information gathered is utilized strictly to:
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400 text-xs">
                    <li>Query live carrier pricing engines across 30+ regional and national LTL carriers</li>
                    <li>Transcribe and dispatch official Bills of Lading (BOLs) to terminal dispatchers and drivers</li>
                    <li>Deliver real-time milestone tracking notifications and proof-of-delivery documentation</li>
                    <li>Email dispatch itineraries and confirmation summaries to Jason@cylltd.com and the booker</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">3. Transmission to Certified Carriers</h3>
                  <p className="text-slate-400 text-xs">
                    When you confirm a booking, pickup and delivery facility contact details are securely transmitted to the selected carrier (e.g. Estes Express, TForce Freight, ABF Freight, FedEx Freight, Forward Air). The carrier uses this data exclusively to coordinate dock arrival, dispatch local drivers, and execute freight delivery.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">4. Security &amp; Encryption Standards</h3>
                  <p className="text-slate-400 text-xs">
                    All communications between your browser, our servers, and carrier API endpoints are encrypted using industry-standard TLS 1.3 encryption. Backend credentials, SMTP relay tokens, and partner carrier keys are isolated in secure server-side environments and never exposed to the client.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">5. Data Retention &amp; Compliance Officer Contact</h3>
                  <p className="text-slate-400 text-xs">
                    In compliance with Federal Motor Carrier Safety Administration (FMCSA) and Department of Transportation (DOT) record-keeping statutes, transportation records and BOLs are archived for a minimum of 3 years. For privacy questions, corrections, or data removal requests, contact our Compliance Director at:
                  </p>
                  <div className="mt-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-300">
                    <div><strong>Jason LTL &bull; CYL Ltd. Transportation Compliance</strong></div>
                    <div>Email: <a href="mailto:Jason@cylltd.com" className="text-[#38BDF8] underline">Jason@cylltd.com</a></div>
                    <div>Direct Terminal Dispatch: US &amp; Canada Cross-Border Operations</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF CARRIAGE */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs">
                <strong>Standard Terms of Transportation Carriage:</strong> By requesting quotes and scheduling carrier dispatches on the Jason LTL platform, users agree to the terms outlined below.
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">1. Quotation Tariff Validity &amp; 120-Second Engine Scans</h3>
                  <p className="text-slate-400 text-xs">
                    Rate quotes generated on this portal reflect direct contractual carrier tariffs. Because carrier pricing databases update constantly, quotes remain valid for <strong>7 calendar days</strong> from the date of generation, subject to prevailing Department of Energy (DOE) fuel surcharges at the time of physical freight pickup. Deep scans for complex or remote lanes may take up to 120 seconds to aggregate rates from all terminal networks.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">2. Billing, Credit &amp; Invoicing</h3>
                  <p className="text-slate-400 text-xs">
                    Invoices are generated upon carrier pickup confirmation. Net-15 or Net-30 terms are extended solely to verified commercial account holders upon credit application approval. Non-account holders must settle via approved credit card or ACH before carrier Bill of Lading release.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">3. Freight Claims &amp; Inspection Procedures</h3>
                  <p className="text-slate-400 text-xs">
                    In the event of cargo loss or physical transit damage, the consignee must note visible damage or shortages directly on the driver&apos;s delivery receipt / electronic POD at the time of delivery. Concealed damage must be formally reported within <strong>5 business days</strong> of delivery with all original packaging retained for carrier joint inspection.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">4. Governing Law &amp; Carmack Amendment</h3>
                  <p className="text-slate-400 text-xs">
                    All interstate shipments are governed by the Carmack Amendment, 49 U.S.C. &sect; 14706. Disputes arising under these terms are subject to the exclusive jurisdiction of the federal and state courts of the designated operating jurisdiction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.09] bg-white/[0.02]">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Double Brokering &bull; Direct Carrier Dispatched</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
