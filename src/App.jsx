import { useEffect, useRef, useState } from 'react';

const navItems = [
  { label: 'Home', icon: '⌂' },
  { label: 'Signals', icon: '◫', active: true },
  { label: 'Queue', icon: '≣' },
  { label: 'Customers', icon: '◎' },
  { label: 'Product Feedback', icon: '◌' },
];

const actionBrief = {
  account: 'Ramp',
  requestTitle: 'Unexpected competitor mentions and citations across key prompts',
  sourceTeam: 'CX',
  customerDeadline: 'Customer review next week',
  urgency: 'High',
  customerRiskLevel: 'High',
  issueSummary:
    'Customer is seeing competitor mentions and unexpected citations across several high-priority prompts in Profound and is unsure whether the pattern reflects actual answer-engine behaviour, prompt configuration issues, or a platform-level technical problem.',
  affectedPrompts: [
    'best corporate card for startups',
    'expense management software for scaling teams',
    'alternatives to Ramp',
  ],
  affectedEngines: ['ChatGPT', 'Perplexity'],
  reportedSymptoms: [
    'Competitors appear more frequently than expected on commercial prompts',
    'Citations point to pages the customer did not expect to surface',
    'Internal customer team is unsure whether to trust the outputs',
    'Customer wants a clear explanation before next week’s review',
  ],
  customerConcern:
    'The customer wants to understand whether this is a real market visibility issue, a setup problem, or a technical issue in Profound before discussing performance with leadership.',
  primaryIssueCategory: 'Multi-factor issue requiring investigation',
  secondaryIssueCategory: 'Prompt configuration issue',
  confidenceLevel: 'Medium',
  hypothesis:
    'The issue is most likely a mix of expected answer-engine behaviour and prompt-set configuration gaps, but a technical check is required before ruling out inconsistent system behaviour or citation handling issues.',
  recommendedDri: 'CX',
  involvedTeams: ['CX', 'Product', 'Engineering'],
  teamResponsibilities: {
    CX: 'Gather specific examples from the customer, confirm which prompts matter most for the upcoming review, manage expectations, and own the customer-facing follow-up.',
    Product:
      'Review whether the current prompt set, reporting experience, or workflow design could be causing confusion or incomplete interpretation of results.',
    Engineering:
      'Validate whether there are any data, citation, parsing, or engine-handling issues affecting the reported outputs.',
  },
  missingInformation: [
    'Exact prompts where the customer observed unexpected competitor mentions',
    'Whether the issue appears consistently or only on a subset of prompts',
    'Whether the issue is limited to ChatGPT and Perplexity or appears elsewhere',
    'Any recent changes to prompt sets, filters, or account configuration',
  ],
  evidenceRequested: [
    '3–5 example prompts flagged by the customer',
    'Screenshots or exports showing unexpected citations',
    'Timestamped examples from the current reporting period',
    'Customer notes on which competitors and pages were considered unexpected',
  ],
  blockingQuestions: [
    'Are the unexpected results concentrated in one engine or across both?',
    'Were these prompts newly added or recently edited?',
    'Is the customer questioning the data itself or the way results are being interpreted?',
    'Are there known internal issues affecting citation extraction or prompt processing for this account?',
  ],
  immediateNextStep:
    'CX to collect 3–5 flagged prompt examples today and open a coordinated review with Product and Engineering.',
  internalActions: [
    'CX to confirm customer deadline and examples',
    'Product to review prompt configuration and reporting workflow',
    'Engineering to run a technical validation on affected prompts and citation outputs',
    'CX to prepare a provisional customer update once initial findings are confirmed',
  ],
  customerResponseRecommendation:
    'We are reviewing a small set of flagged prompts to determine whether this reflects actual answer-engine behaviour, prompt setup, or a technical issue. We will return with a clearer explanation and recommended next steps before the review.',
  customerFacingNarrative:
    'We have enough signal to treat this as a real cross-functional investigation, but not enough evidence yet to conclude whether the issue is market-driven, configuration-driven, or technical.',
  escalationRequired: false,
  status: 'Needs evidence',
};

const initialDrafts = {
  initial:
    'Thanks for flagging this. We have reviewed the signal and are aligning internally on whether the unexpected competitor mentions reflect answer-engine behaviour, prompt setup, or a technical issue. We will come back with a clearer explanation before next week’s review.',
  queued:
    'We have opened this for internal review and are pulling together the most relevant prompt examples to understand whether the pattern is driven by live engine behaviour, configuration choices, or a platform issue. We’ll share a clearer readout ahead of your review.',
  cx:
    'We are now reviewing flagged examples from your team and confirming whether the issue appears consistently across both ChatGPT and Perplexity. Once we validate the examples, we’ll outline what is signal versus what may require configuration or technical follow-up.',
  cxReady:
    'We have confirmed an initial set of flagged prompts and examples for review, and the issue appears across both ChatGPT and Perplexity. We are now moving this into structured cross-functional review so we can separate market behaviour from configuration or technical causes.',
  product:
    'We have enough examples to begin cross-functional review. Product is assessing whether prompt-set composition or reporting interpretation is contributing to the pattern, while we continue validating the underlying outputs.',
  engineering:
    'Engineering has been pulled into the investigation to validate citation handling and engine-specific behaviour on the flagged prompts. We’re consolidating findings across CX, Product, and Engineering so we can give you a grounded explanation before the review.',
};

const timestamps = {
  analysed: '9:12 AM',
  queued: '9:18 AM',
  cxAssigned: '9:24 AM',
  cxNotes: '10:02 AM',
  product: '10:21 AM',
  engineering: '10:47 AM',
};

const seedQueue = [
  {
    caseNumber: 'SD-1038',
    account: 'Brex',
    status: 'Ready for update',
    dri: 'CX',
    nextMilestone: 'Send findings summary',
    lastUpdated: '2h ago',
    selected: false,
  },
  {
    caseNumber: 'SD-1036',
    account: 'Deel',
    status: 'Under Product review',
    dri: 'Product',
    nextMilestone: 'Review setup pattern',
    lastUpdated: '5h ago',
    selected: false,
  },
  {
    caseNumber: 'SD-1031',
    account: 'Mercury',
    status: 'Pending Engineering',
    dri: 'Engineering',
    nextMilestone: 'Validate citation output',
    lastUpdated: 'Yesterday',
    selected: false,
  },
];

const cxChecklistItems = [
  'Confirm top 3 affected prompts',
  'Collect screenshots or exports',
  'Confirm deadline for customer review',
  'Clarify whether issue appears in both engines',
];

const seededCxNotes = [
  'Customer flagged three comparison prompts tied to commercial discovery',
  'Unexpected competitor mentions observed in ChatGPT and Perplexity',
  'Customer unsure whether citations reflect true market position or misconfiguration',
  'Review needed before business review next week',
];

const productAssessment = [
  'Prompt-set composition may be contributing to the observed competitor mix',
  'Reporting interpretation may be increasing customer confusion',
  'Technical validation recommended before confirming root cause',
];

const engineeringTicket = [
  'Validate citation extraction on flagged prompts',
  'Check for engine-specific inconsistencies across ChatGPT and Perplexity',
  'Confirm no recent parsing or pipeline regressions for this account',
];

function getActiveStatus(workflow) {
  if (workflow.engineeringRaised) return 'Pending Engineering investigation';
  if (workflow.productRequested) return 'Under Product review';
  if (workflow.queued) return 'Needs CX follow-up';
  return 'Needs evidence';
}

function getQueueStatusLabel(status) {
  switch (status) {
    case 'Pending Engineering investigation':
      return 'Pending Engineering';
    case 'Ready for customer update':
      return 'Ready for update';
    default:
      return status;
  }
}

function App() {
  const [workflow, setWorkflow] = useState({
    queued: false,
    cxAssigned: false,
    cxNotesAdded: false,
    productRequested: false,
    engineeringRaised: false,
  });
  const [timeline, setTimeline] = useState([
    { label: 'Request analysed', time: timestamps.analysed },
  ]);
  const [customerDraft, setCustomerDraft] = useState(initialDrafts.initial);
  const [checklistState, setChecklistState] = useState(
    cxChecklistItems.map((item) => ({ label: item, complete: false })),
  );
  const timelineRef = useRef(null);

  const activeStatus = getActiveStatus(workflow);

  const activeDri = workflow.productRequested ? 'Product' : 'CX';

  useEffect(() => {
    if (!timelineRef.current) return;
    timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
  }, [timeline]);

  const queueRows = [
    ...(workflow.queued
      ? [
          {
            caseNumber: 'SD-1042',
            account: 'Ramp',
            status: getQueueStatusLabel(activeStatus),
            dri: activeDri,
            nextMilestone: workflow.engineeringRaised
              ? 'Complete technical validation'
              : workflow.productRequested
                ? 'Review technical recommendation'
                : workflow.cxAssigned
                  ? 'Review Product assessment'
                  : 'Queue for CX triage',
            lastUpdated: 'Just now',
            selected: true,
          },
        ]
      : []),
    ...seedQueue,
  ];

  const appendTimeline = (label, time) => {
    setTimeline((current) => [...current, { label, time }]);
  };

  const handleQueue = () => {
    if (workflow.queued) return;
    setWorkflow((current) => ({ ...current, queued: true }));
    setCustomerDraft(initialDrafts.queued);
    appendTimeline('Case added to investigation queue', timestamps.queued);
  };

  const handleAssignCx = () => {
    if (!workflow.queued || workflow.cxAssigned) return;
    setWorkflow((current) => ({ ...current, cxAssigned: true }));
    setCustomerDraft(initialDrafts.cx);
    setChecklistState((current) =>
      current.map((item, index) => ({
        ...item,
        complete: index === 2,
      })),
    );
    appendTimeline('CX follow-up assigned', timestamps.cxAssigned);
  };

  const handleAddCxNotes = () => {
    if (!workflow.cxAssigned || workflow.cxNotesAdded) return;
    setWorkflow((current) => ({ ...current, cxNotesAdded: true }));
    setChecklistState((current) =>
      current.map((item, index) => ({
        ...item,
        complete: index < 3,
      })),
    );
    setCustomerDraft(initialDrafts.cxReady);
    appendTimeline('CX notes and examples added', timestamps.cxNotes);
  };

  const handleProductReview = () => {
    if (!workflow.cxAssigned || workflow.productRequested) return;
    setWorkflow((current) => ({ ...current, productRequested: true }));
    setCustomerDraft(initialDrafts.product);
    appendTimeline('Product review requested', timestamps.product);
  };

  const handleEngineering = () => {
    if (!workflow.productRequested || workflow.engineeringRaised) return;
    setWorkflow((current) => ({ ...current, engineeringRaised: true }));
    setCustomerDraft(initialDrafts.engineering);
    appendTimeline('Engineering ticket raised', timestamps.engineering);
  };

  const handleRefreshDraft = () => {
    if (workflow.engineeringRaised) {
      setCustomerDraft(initialDrafts.engineering);
      return;
    }
    if (workflow.productRequested) {
      setCustomerDraft(initialDrafts.product);
      return;
    }
    if (workflow.cxNotesAdded) {
      setCustomerDraft(initialDrafts.cxReady);
      return;
    }
    if (workflow.cxAssigned) {
      setCustomerDraft(initialDrafts.cx);
      return;
    }
    if (workflow.queued) {
      setCustomerDraft(initialDrafts.queued);
      return;
    }
    setCustomerDraft(initialDrafts.initial);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-name">Profound</div>
            <div className="brand-subtitle">Internal workspace</div>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-card">
            <span className="footer-label">Today</span>
            <strong>6 active investigations</strong>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="toolbar">
          <div>
            <div className="breadcrumb">Signals / Coordination</div>
            <h1>Signal Desk</h1>
          </div>
          <div className="toolbar-controls">
            {['All teams', 'Active cases', 'High urgency', 'Filter'].map((chip) => (
              <span key={chip} className="toolbar-chip">
                {chip}
              </span>
            ))}
          </div>
        </header>

        <section className="top-grid">
          <Panel title="Incoming signal" headerRight={<StatusChip label={actionBrief.urgency} tone="high" />}>
            <div className="meta-grid">
              <MetaItem label="Case number" value="SD-1042" />
              <MetaItem label="Account" value="Ramp" />
              <MetaItem label="Source team" value="CX" />
              <MetaItem label="Urgency" value="High" />
              <MetaItem label="Customer deadline" value="Customer review next week" />
            </div>
            <div className="signal-body">
              <p>
                We’re seeing competitor mentions and citations in Profound that our team did not expect
                for several important prompts. It’s unclear whether this reflects the actual answer-engine
                landscape, an issue with how our prompts are configured, or something technical in the
                platform. We need clarity before next week’s customer review.
              </p>
            </div>
          </Panel>

          <Panel
            title="Structured action brief"
            headerRight={
              <div className="header-chips">
                <StatusChip label={activeStatus} tone="info" />
                <StatusChip label={`DRI ${activeDri}`} tone="neutral" />
              </div>
            }
            spotlight
          >
            <div className="brief-stack">
              <BriefSection title="Overview">
                <KeyValue label="Account" value={actionBrief.account} />
                <KeyValue label="Request title" value={actionBrief.requestTitle} />
                <KeyValue label="Source team" value={actionBrief.sourceTeam} />
                <KeyValue label="Customer deadline" value={actionBrief.customerDeadline} />
                <KeyValue label="Urgency" value={actionBrief.urgency} />
                <KeyValue label="Customer risk level" value={actionBrief.customerRiskLevel} />
                <KeyValue label="Status" value={activeStatus} />
              </BriefSection>

              <BriefSection title="Signal summary">
                <p>{actionBrief.issueSummary}</p>
                <TagRow label="Affected prompts" items={actionBrief.affectedPrompts} />
                <TagRow label="Affected engines" items={actionBrief.affectedEngines} />
                <ListBlock label="Reported symptoms" items={actionBrief.reportedSymptoms} />
                <KeyValue label="Customer concern" value={actionBrief.customerConcern} />
              </BriefSection>

              <BriefSection title="Likely diagnosis">
                <KeyValue label="Primary issue category" value={actionBrief.primaryIssueCategory} />
                <KeyValue label="Secondary issue category" value={actionBrief.secondaryIssueCategory} />
                <KeyValue label="Confidence level" value={actionBrief.confidenceLevel} />
                <KeyValue label="Hypothesis" value={actionBrief.hypothesis} />
              </BriefSection>

              <BriefSection title="Team routing">
                <KeyValue label="Recommended DRI" value={actionBrief.recommendedDri} />
                <TagRow label="Involved teams" items={actionBrief.involvedTeams} />
                <div className="responsibility-grid">
                  {Object.entries(actionBrief.teamResponsibilities).map(([team, responsibility]) => (
                    <div key={team} className="responsibility-card">
                      <span className="responsibility-team">{team}</span>
                      <p>{responsibility}</p>
                    </div>
                  ))}
                </div>
              </BriefSection>

              <BriefSection title="Missing evidence">
                <ListBlock label="Missing information" items={actionBrief.missingInformation} />
                <ListBlock label="Evidence requested" items={actionBrief.evidenceRequested} />
                <ListBlock label="Blocking questions" items={actionBrief.blockingQuestions} />
              </BriefSection>

              <BriefSection title="Next actions">
                <KeyValue label="Immediate next step" value={actionBrief.immediateNextStep} />
                <ListBlock label="Internal actions" items={actionBrief.internalActions} />
                <KeyValue
                  label="Customer response recommendation"
                  value={actionBrief.customerResponseRecommendation}
                />
                <KeyValue label="Customer-facing narrative" value={actionBrief.customerFacingNarrative} />
                <KeyValue
                  label="Escalation required"
                  value={actionBrief.escalationRequired ? 'True' : 'False'}
                />
              </BriefSection>
            </div>
          </Panel>

          <Panel title="Actions + customer update draft">
            <div className="action-list">
              <ActionButton
                label={workflow.queued ? 'Added to investigation queue' : 'Add to investigation queue'}
                enabled={!workflow.queued}
                complete={workflow.queued}
                onClick={handleQueue}
              />
              <ActionButton
                label="Assign CX follow-up"
                enabled={workflow.queued && !workflow.cxAssigned}
                complete={workflow.cxAssigned}
                onClick={handleAssignCx}
              />
              <ActionButton
                label="Request Product review"
                enabled={workflow.cxAssigned && !workflow.productRequested}
                complete={workflow.productRequested}
                onClick={handleProductReview}
              />
              <ActionButton
                label="Raise Engineering ticket"
                enabled={workflow.productRequested && !workflow.engineeringRaised}
                complete={workflow.engineeringRaised}
                onClick={handleEngineering}
              />
            </div>

            <button type="button" className="link-action" onClick={handleRefreshDraft}>
              Refresh customer draft
            </button>

            {workflow.cxAssigned && (
              <div className="reveal-block">
                <div className="subpanel-header">
                  <div>
                    <h3>CX evidence checklist</h3>
                    <span className="assignee-chip">CX owner</span>
                  </div>
                  <StatusChip label={activeStatus} tone="neutral" />
                </div>
                <div className="checklist">
                  {checklistState.map((item) => (
                    <div key={item.label} className={`check-item ${item.complete ? 'complete' : ''}`}>
                      <span className="check-icon">{item.complete ? '✓' : '○'}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="notes-panel">
                  <div className="notes-header">
                    <h4>CX notes</h4>
                    <button
                      type="button"
                      className="inline-action"
                      onClick={handleAddCxNotes}
                      disabled={workflow.cxNotesAdded || workflow.productRequested}
                    >
                      {workflow.cxNotesAdded ? 'Notes added' : 'Add sample CX notes'}
                    </button>
                  </div>
                  <div className={`notes-body ${workflow.cxNotesAdded ? 'filled' : ''}`}>
                    {workflow.cxNotesAdded ? (
                      <ul>
                        {seededCxNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Waiting for CX follow-up examples, screenshots, and customer context.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {workflow.productRequested && (
              <div className="reveal-block">
                <div className="subpanel-header">
                  <div>
                    <h3>Product assessment</h3>
                    <span className="assignee-chip product">Product reviewer</span>
                  </div>
                  <StatusChip label="Active review" tone="info" />
                </div>
                <ul className="stack-list">
                  {productAssessment.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {workflow.engineeringRaised && (
              <div className="reveal-block">
                <div className="subpanel-header">
                  <div>
                    <h3>Engineering ticket</h3>
                    <span className="assignee-chip engineering">Engineering</span>
                  </div>
                  <StatusChip label="Opened" tone="success" />
                </div>
                <ul className="stack-list">
                  {engineeringTicket.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="draft-panel">
              <div className="subpanel-header">
                <h3>Customer update draft</h3>
                <span className="muted-label">Living artifact</span>
              </div>
              <p>{customerDraft}</p>
            </div>
          </Panel>
        </section>

        <section className="bottom-grid">
          <Panel title="Investigation queue">
            <div className="queue-table">
              <div className="queue-head">
                <span>Case #</span>
                <span>Account</span>
                <span>Status</span>
                <span>DRI</span>
                <span>Next milestone</span>
                <span>Last updated</span>
              </div>
              {queueRows.map((row) => (
                <div key={row.caseNumber} className={`queue-row ${row.selected ? 'selected' : ''}`}>
                  <span>{row.caseNumber}</span>
                  <span>{row.account}</span>
                  <span>
                    <StatusChip
                      label={row.status}
                      compact
                      tone={
                        row.status.includes('Engineering')
                          ? 'neutral'
                          : row.status.includes('Product')
                            ? 'info'
                            : row.status.includes('customer')
                              ? 'success'
                              : 'neutral'
                      }
                    />
                  </span>
                  <span>{row.dri || 'TBD'}</span>
                  <span>{row.nextMilestone}</span>
                  <span>{row.lastUpdated}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Case timeline / handoff log">
            <div className="timeline" ref={timelineRef}>
              {timeline.map((event, index) => (
                <div key={`${event.label}-${event.time}`} className="timeline-item">
                  <div className="timeline-marker">
                    <span className="timeline-dot" />
                    {index !== timeline.length - 1 && <span className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{event.label}</div>
                    <div className="timeline-time">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

function Panel({ title, headerRight, children, spotlight = false }) {
  return (
    <section className={`panel ${spotlight ? 'spotlight' : ''}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        {headerRight}
      </div>
      <div className="panel-content">{children}</div>
    </section>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BriefSection({ title, children }) {
  return (
    <div className="brief-section">
      <h3>{title}</h3>
      <div className="brief-section-body">{children}</div>
    </div>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className="key-value">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function TagRow({ label, items }) {
  return (
    <div className="key-value">
      <span>{label}</span>
      <div className="tag-row">
        {items.map((item) => (
          <span key={item} className="tag">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListBlock({ label, items }) {
  return (
    <div className="key-value">
      <span>{label}</span>
      <ul className="stack-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ActionButton({ label, enabled, complete, onClick }) {
  return (
    <button
      type="button"
      className={`action-button ${enabled ? 'enabled' : ''} ${complete ? 'complete' : ''}`}
      onClick={onClick}
      disabled={!enabled}
    >
      <span>{label}</span>
      <span className="action-state">{complete ? 'Done' : enabled ? 'Ready' : 'Locked'}</span>
    </button>
  );
}

function StatusChip({ label, tone = 'neutral', compact = false }) {
  return <span className={`status-chip ${tone} ${compact ? 'compact' : ''}`}>{label}</span>;
}

export default App;
