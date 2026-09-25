import type { ReactNode } from 'react'

export type Author = {
  name: string
  role: string
  avatar: string
  linkedin: string
}

export type TocItem = { id: string; label: string }

export type BlogPost = {
  slug: string
  category: string
  gradient: string
  title: string
  description: string
  author: Author
  minutes: number
  dateISO: string
  dateLabel: string
  toc: TocItem[]
  tags: string[]
  body: () => ReactNode
}

const alexis: Author = {
  name: 'Alexis Jarre',
  role: 'CMO & Co-founder',
  avatar: 'alex.png',
  linkedin: 'https://www.linkedin.com/in/alexis-jarre/',
}

const justine: Author = {
  name: 'Justine Namour',
  role: 'CTO & Co-founder',
  avatar: 'ju.jpeg',
  linkedin: 'https://www.linkedin.com/in/justine-namour-709951388',
}

const thomas: Author = {
  name: 'Thomas Marcelle',
  role: 'CEO & Co-founder',
  avatar: 'tom.png',
  linkedin: 'https://www.linkedin.com/in/thomas-marcelle',
}

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

function TrackingTemplateBody() {
  return (
    <>
      <p>
        A useful B2B creator campaign tracker has one row per published post and enough structure
        to answer three questions: what went live, what happened after the click, and what
        decision should the team make next. It does not need a custom dashboard. It needs stable
        IDs, disciplined links, a clean handoff to the CRM and written rules for what counts as
        evidence.
      </p>
      <p>
        That sounds basic. In practice, campaign measurement often breaks before the first post is
        published. One person names the campaign in a spreadsheet, another builds a link in a chat
        message, the creator copies a different landing page, and sales later receives a lead with
        no durable connection to the post. A sophisticated attribution model cannot repair missing
        identifiers.
      </p>
      <p>
        This playbook gives you a copyable field list, a UTM convention, a QA routine and a weekly
        review format.
      </p>

      <h2 id="start-with-the-decision-then-choose-the-fields">
        Start with the decision, then choose the fields
      </h2>
      <p>
        Measurement should begin with the decision the campaign is supposed to support. “Track
        performance” is not a decision. These are:
      </p>
      <ul>
        <li>rebook this creator for the next campaign;</li>
        <li>test a second angle with the same audience;</li>
        <li>stop sending traffic to this landing page;</li>
        <li>move budget from broad discovery to a specialist creator;</li>
        <li>keep the channel running long enough to observe qualified pipeline;</li>
        <li>separate a delivery problem from a conversion problem.</li>
      </ul>
      <p>
        Write the decision at the top of the tracker. Then collect only the fields that change it.
        This prevents the familiar dashboard with dozens of engagement columns and no answer to the
        budget question.
      </p>
      <p>
        Do not ask one metric to do every job. Publication status proves delivery. Tagged visits
        prove attributable traffic. Form submissions prove conversion events. CRM stages show what
        sales accepted and progressed. Revenue proves a commercial outcome. Each layer has a
        different owner and a different delay.
      </p>

      <h2 id="the-copyable-campaign-data-dictionary">The copyable campaign data dictionary</h2>
      <p>
        Create one row for every distinct post. If a creator publishes twice, use two rows. If the
        same post has two destination links, either choose one primary link or store a child link
        table; do not compress two journeys into one cell.
      </p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Example format</th>
            <th>Why it exists</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['campaign_id', 'q4-devtools-fr-01', 'Stable join key across the tracker, analytics and CRM'],
            ['post_id', 'q4-devtools-fr-01-p07', 'One identifier for one deliverable'],
            [
              'creator_id',
              'Internal ID, not a display name',
              'Survives name changes and reduces public personal data in URLs',
            ],
            ['audience_hypothesis', 'RevOps leaders at EU SaaS', 'Records why the creator was selected'],
            ['angle', 'CRM migration checklist', 'Separates audience quality from creative quality'],
            [
              'fixed_fee',
              'Currency plus amount',
              "Captures the booked deliverable cost; Naano prices posts at a fixed fee set by the creator",
            ],
            [
              'status',
              'booked, draft, approved, published, cancelled',
              'Distinguishes buying activity from delivered content',
            ],
            ['planned_at', 'ISO date and time', 'Makes schedule variance visible'],
            ['published_at', 'ISO date and time', 'Starts the measurement clock'],
            ['post_url', 'Final public LinkedIn URL', 'Proves the deliverable and anchors manual review'],
            ['landing_url', 'Canonical destination without tags', 'Keeps the underlying page explicit'],
            ['tagged_url', 'Final QA-approved URL', 'Connects the post to analytics'],
            ['sessions', 'Analytics count', 'Observed destination traffic, with the analytics source named'],
            [
              'primary_conversion',
              'Named event plus count',
              'The action the campaign was designed to generate',
            ],
            ['qualified_leads', 'CRM-defined count', 'Applies the same qualification rule used by other channels'],
            [
              'opportunities',
              'Count plus IDs in a restricted system',
              'Connects marketing activity to pipeline without putting personal data in the sheet',
            ],
            ['pipeline_value', 'Currency plus amount', 'Uses CRM opportunity value, not a model estimate'],
            ['evidence_cutoff', 'ISO date and time', 'Says when the numbers were read'],
            ['exclusions', 'Bots, employees, test forms', 'Makes every published figure interpretable'],
            ['decision', 'rebook, iterate, stop, wait', 'Forces the review to end with an action'],
            ['decision_reason', 'One sentence', 'Preserves the reasoning for the next reviewer'],
          ].map(([field, example, why]) => (
            <tr key={field}>
              <td>
                <code>{field}</code>
              </td>
              <td>{example}</td>
              <td>{why}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Protect fields that contain opportunity IDs or commercial values. A shared editorial
        tracker can link to a restricted CRM view instead of copying customer or lead details into
        a document that every creator can see.
      </p>

      <h2 id="use-one-utm-language-across-every-post">Use one UTM language across every post</h2>
      <p>
        Google Analytics documents <code>utm_source</code>, <code>utm_medium</code>,{' '}
        <code>utm_campaign</code>, <code>utm_id</code> and <code>utm_source_platform</code> as
        relevant campaign parameters, with <code>utm_content</code> available to distinguish
        creative variants. A workable convention for organic creator posts is:
      </p>
      <pre>
        <code>
          utm_source=linkedin{'\n'}
          utm_medium=creator{'\n'}
          utm_campaign=q4_devtools_fr{'\n'}
          utm_id=q4-devtools-fr-01{'\n'}
          utm_content=creator_042_post_01
        </code>
      </pre>
      <p>
        Keep values lowercase. Use underscores or hyphens consistently. Do not put an email
        address, prospect name or private campaign note in a URL. Query parameters travel through
        browsers, analytics systems, screenshots and logs; treat them as public.
      </p>
      <p>
        Before the creator receives the link, open it in a private browser window, confirm the
        redirect preserves the parameters, submit a test conversion and verify that the event
        reaches the expected analytics property. A link is not “tracked” because it contains{' '}
        <code>utm_</code>; it is tracked when the destination and conversion event have both been
        observed.
      </p>

      <h2 id="separate-delivery-traffic-conversion-and-pipeline">
        Separate delivery, traffic, conversion and pipeline
      </h2>
      <p>Use four layers instead of one blended score.</p>
      <h3>Delivery</h3>
      <p>
        Was the agreed post published, on the agreed profile, with the required disclosure and
        destination link? Store the public URL and publication time. If delivery failed, diagnose
        booking and approval before discussing campaign ROI.
      </p>
      <h3>Traffic</h3>
      <p>
        How many verified sessions reached the destination through the post's tagged link? Define
        the analytics source and bot rules. Do not substitute a reach estimate for observed site
        traffic, and do not call every click qualified.
      </p>
      <h3>Conversion</h3>
      <p>
        Which destination event matters: signup, demo request, trial activation, resource download
        or another declared action? Use one primary conversion for the decision and keep secondary
        events diagnostic.
      </p>
      <h3>Pipeline</h3>
      <p>
        Which leads met the company's existing qualification rule, became opportunities and
        progressed? Preserve the original creator touch even when a later branded search or sales
        email closes the journey.
      </p>
      <p>
        This is also why tracking is separate from pricing. Naano's current commercial unit is the
        creator's fixed fee for the sponsored post. Clicks, leads and pipeline help decide what to
        rebook; they do not change the price after publication.
      </p>

      <h2 id="run-qa-at-three-moments">Run QA at three moments</h2>
      <h3>Before publication</h3>
      <p>
        Confirm the final landing page, tagged URL, redirect, consent behaviour, conversion event,
        campaign ID and disclosure. Ask the creator to paste the exact approved link rather than
        rebuilding it.
      </p>
      <h3>Within one business day of publication</h3>
      <p>
        Open the public post. Check that the link resolves, the disclosure is visible and the post
        URL is stored. Do not wait for the weekly report to discover that a parameter was stripped.
      </p>
      <h3>At the reporting cutoff</h3>
      <p>
        Freeze the extraction time, query or report name, exclusions and sample size. A number
        without its cutoff will change under the next reviewer.
      </p>

      <h2 id="use-a-weekly-decision-table-not-a-leaderboard">
        Use a weekly decision table, not a leaderboard
      </h2>
      <p>End the review with a short table:</p>
      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Delivery</th>
            <th>Traffic evidence</th>
            <th>Conversion evidence</th>
            <th>Pipeline maturity</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>p07</td>
            <td>Published as scoped</td>
            <td>Enough verified sessions to read</td>
            <td>Primary event observed</td>
            <td>Too early</td>
            <td>Keep observing</td>
          </tr>
          <tr>
            <td>p08</td>
            <td>Published late</td>
            <td>Link worked</td>
            <td>No primary event</td>
            <td>Too early</td>
            <td>Test a different angle</td>
          </tr>
          <tr>
            <td>p09</td>
            <td>Not published</td>
            <td>None</td>
            <td>None</td>
            <td>Not applicable</td>
            <td>Fix delivery before rebooking</td>
          </tr>
        </tbody>
      </table>
      <p>
        Avoid ranking creators on raw reactions. A specialist post can generate a small visible
        response and still bring the right operators into the funnel. Use{' '}
        <strong>wait</strong> as a real decision when the buying cycle is longer than the reporting
        window.
      </p>

      <h2 id="keep-the-tracker-useful-after-the-campaign">
        Keep the tracker useful after the campaign
      </h2>
      <p>
        At the close of the campaign, preserve the final rows, field definitions and decision
        notes. Remove unnecessary personal data. Link to the approved brief and public post, but
        keep contracts and restricted CRM records in their proper systems.
      </p>
      <p>
        The next campaign should reuse IDs and definitions, not conclusions. A creator who worked
        for one audience and angle has earned a clearer hypothesis, not a permanent score.
      </p>

      <h2 id="frequently-asked-questions">Frequently asked questions</h2>
      <h3>What should a B2B creator campaign tracker contain?</h3>
      <p>
        Keep one row per published post with a stable campaign ID, creator ID, booking cost,
        destination URL, tagged link, publication time, post URL, visits, conversions, pipeline
        value and a notes field.
      </p>
      <h3>Which UTM parameters should a creator post use?</h3>
      <p>
        Use a consistent lowercase convention for <code>utm_source</code>, <code>utm_medium</code>{' '}
        and <code>utm_campaign</code>, plus <code>utm_content</code> to distinguish the creator and
        post.
      </p>
      <h3>Should creator marketing use last-click attribution?</h3>
      <p>
        Last click is useful as one observation, but it should not be the only view for a B2B
        purchase. Preserve the first creator touch, the converting session and the CRM opportunity
        history separately.
      </p>
      <h3>How often should a creator campaign be reviewed?</h3>
      <p>
        Check links and landing pages before publication, reconcile delivery within one business
        day, review traffic and conversion quality weekly, and review pipeline on the sales cycle
        that matches the product.
      </p>
      <p>
        If you want the booking, fixed-fee payment and post-level workflow in one place,{' '}
        <a href="/#pricing">start a creator campaign on Naano</a>. Build the tracker before the
        first brief, then use it to decide which creators and angles deserve the next budget.
      </p>
    </>
  )
}

function UsageRightsBody() {
  return (
    <>
      <p>
        The fixed fee for a sponsored LinkedIn post should buy one clear deliverable: a disclosed
        organic post published from the creator's own profile. If a brand also wants to boost that
        post, reuse the copy on its website, cut it into ads, keep it live in paid media for a year
        or put the creator's face in sales material, those are additional usage rights. They need
        their own written scope.
      </p>
      <p>
        Creators often discuss rights too late. The draft is approved, the post is live and then
        someone asks, “Can we put spend behind this?” Saying yes feels helpful. But a one-line
        approval can turn a single organic deliverable into a paid-media asset with a different
        audience, lifespan and risk.
      </p>
      <p>
        This guide is a commercial checklist, not legal advice. It explains the decisions a B2B
        LinkedIn creator should settle before quoting usage.
      </p>

      <h2 id="name-the-baseline-before-discussing-extras">
        Name the baseline before discussing extras
      </h2>
      <p>Write the organic deliverable first:</p>
      <blockquote>
        One sponsored LinkedIn post, written in the creator's voice, published on the creator's
        profile during the agreed window, with the paid relationship disclosed. The creator keeps
        ownership of the original work.
      </blockquote>
      <p>
        On Naano, the creator sets a fixed fee for the sponsored post. That fee is the price of the
        agreed deliverable. It is not a promise of clicks, leads or revenue, and it should not
        silently transfer every future use of the content.
      </p>

      <h2 id="build-the-rights-matrix-before-you-quote">Build the rights matrix before you quote</h2>
      <p>Ask the brand to mark every row it wants.</p>
      <table>
        <thead>
          <tr>
            <th>Use</th>
            <th>Question to settle</th>
            <th>Safe written boundary</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Organic publication', 'Who publishes, where and for how long?', "One post on the creator's named LinkedIn profile"],
            ['Link and reshare', 'May the brand point people to the live post?', "Link or native reshare without editing the creator's words"],
            ['Paid amplification', 'May the brand sponsor the post as an ad?', 'Named advertiser, platform, term and approved post'],
            ['Brand-owned repost', "May the copy appear on the brand's site, Page or newsletter?", 'Named channels and exact version, with attribution and disclosure context'],
            ['Editing', 'May the brand shorten, translate or redesign the content?', 'List permitted edits and require approval for material changes'],
            ["Name and likeness", "May the creator's face, name or job title appear outside the post?", 'Named placements and term; no implied endorsement of other products'],
            ['Derivative content', 'May the post become clips, graphics, sales slides or ads?', 'Define the formats and approval process'],
            ['Territory and language', 'Where and in which languages can it run?', 'Countries or worldwide, plus named languages'],
            ['Duration', 'When does the permission end?', 'Start date, end date and takedown process'],
            ['Exclusivity', 'Which competing work is restricted?', 'Narrow category, named competitors and fixed period'],
          ].map(([use, q, safe]) => (
            <tr key={use}>
              <td>{use}</td>
              <td>{q}</td>
              <td>{safe}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        “Usage rights included” is not a scope. Neither is “full rights.” The useful contract says
        who may use what, where, how, for how long and with which edits.
      </p>

      <h2 id="linkedin-permission-and-commercial-permission-are-separate">
        LinkedIn permission and commercial permission are separate
      </h2>
      <p>
        LinkedIn's current{' '}
        <Ext href="https://www.linkedin.com/help/linkedin">Thought Leader Ads documentation</Ext>{' '}
        says an advertiser must request permission from the member before sponsoring the member's
        organic post. That platform workflow answers: “May this advertiser sponsor this post
        inside LinkedIn?” It does not write your commercial deal. Before approving the request,
        agree:
      </p>
      <ul>
        <li>which brand and ad account may use the post;</li>
        <li>the paid-amplification period;</li>
        <li>the countries and audiences in scope;</li>
        <li>whether the original post must remain unchanged;</li>
        <li>who funds media spend;</li>
        <li>what reporting the creator receives;</li>
        <li>the usage fee or whether amplification is explicitly included;</li>
        <li>what happens at the end of the term.</li>
      </ul>
      <p>
        The advertiser's media budget is not the creator's post fee. A brand can spend far more on
        distribution than it paid for production.
      </p>

      <h2 id="price-the-scope-not-a-universal-multiplier">Price the scope, not a universal multiplier</h2>
      <p>
        There is no honest percentage that prices every usage-rights deal. Ask six questions: is
        there paid media, how long, where, can the brand edit, is the creator's likeness used, is
        there exclusivity.
      </p>
      <p>
        Quote the organic post and each extra scope as separate lines. If the budget cannot support
        the requested rights, narrow the rights — shorten the term, remove derivative edits or keep
        the use to LinkedIn. Do not lower the organic post rate and quietly leave the same broad
        licence in place.
      </p>

      <h2 id="control-edits-and-factual-claims">Control edits and factual claims</h2>
      <p>
        The original post was approved in a specific context. A cropped quote, translated graphic
        or rewritten hook can change its meaning. Give the brand a practical editing rule: technical
        crops may be allowed, spelling corrections may be allowed, material copy edits and new
        claims require creator approval, and the brand may not combine the creator's words with
        another product or claim.
      </p>
      <p>
        Never approve a product claim you cannot substantiate. A usage licence does not convert the
        brand's assertion into the creator's experience.
      </p>

      <h2 id="disclosure-survives-amplification-and-reuse">
        Disclosure survives amplification and reuse
      </h2>
      <p>
        Rights and disclosure are separate gates. The{' '}
        <Ext href="https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers">
          U.S. Federal Trade Commission
        </Ext>{' '}
        says material relationships should be disclosed clearly and where people can notice the
        disclosure. The practical contract rule is simple: the brand must preserve the commercial
        context when it reuses the endorsement.
      </p>
      <p>
        Disclose in the language of the content. Keep the disclosure attached when a quote becomes
        a graphic or a post becomes an ad. If a short crop cannot carry the necessary context, it is
        the wrong crop.
      </p>

      <h2 id="write-the-approval-message-before-the-request-arrives">
        Write the approval message before the request arrives
      </h2>
      <blockquote>
        Happy to consider paid amplification. My current fee covers the disclosed organic LinkedIn
        post only. Please send the advertiser, platform, countries, start and end dates, expected
        media use, edit requirements and any exclusivity.
      </blockquote>
      <p>
        This does not make the relationship adversarial. A good buyer will prefer a clear
        permission record to an ambiguous chat approval.
      </p>

      <h2 id="close-the-term-deliberately">Close the term deliberately</h2>
      <p>
        Set a reminder before the licence ends. Ask whether the brand wants to stop, renew the same
        use or commission a new asset. Confirm the outcome in writing.
      </p>
      <p>
        Do not treat expiry as a trap. The aim is a useful, renewable asset with a known boundary.
      </p>

      <h2 id="frequently-asked-questions">Frequently asked questions</h2>
      <h3>What usage rights are normally included in a sponsored LinkedIn post?</h3>
      <p>
        The safest baseline is one disclosed organic post on the creator's own LinkedIn profile for
        the agreed fixed fee. Reposting the copy elsewhere, editing it, using the creator's likeness
        or running paid amplification should be written as separate permissions.
      </p>
      <h3>Does a brand need permission to run a creator post as a Thought Leader Ad?</h3>
      <p>
        Yes. LinkedIn requires the advertiser to request the member's permission before sponsoring
        an organic post. That platform approval does not replace the commercial agreement between
        creator and brand.
      </p>
      <h3>How should a creator price usage rights?</h3>
      <p>
        Price the rights from the actual scope instead of applying a universal multiplier: where
        the content will run, whether media spend is paid, how long the permission lasts, whether
        the brand can edit the work, and whether exclusivity applies.
      </p>
      <h3>Do usage rights remove the need to disclose a paid relationship?</h3>
      <p>
        No. Licensing and disclosure solve different problems. A creator still needs a clear,
        hard-to-miss disclosure for the paid relationship.
      </p>
      <p>
        If you want sponsored opportunities where the organic deliverable and fixed post price are
        clear before you accept, <a href="/creators">join Naano as a creator</a>. Set your price
        for the post, keep extra rights explicit and approve only the uses you understand.
      </p>
    </>
  )
}

function FindBrandDealsBody() {
  return (
    <>
      <p>
        Finding brand deals on LinkedIn is not a matter of adding “open to collaborations” to your
        headline and waiting. It is a small B2B sales process: choose sponsors that belong in your
        editorial lane, show why your audience is relevant, propose a post only you could write and
        make the commercial terms easy to approve.
      </p>
      <p>
        Brands do not need another creator who can repeat a product brief. They need a credible
        practitioner whose normal audience already cares about the problem the product solves.
      </p>

      <h2 id="first-know-what-a-linkedin-brand-deal-is">First, know what a LinkedIn brand deal is</h2>
      <p>
        A creator brand deal is an agreement with a company to publish content from your personal
        LinkedIn account in exchange for money, a product, a service or another benefit. You keep
        an identifiable editorial voice; the company receives an agreed deliverable and whatever
        usage rights are written into the deal.
      </p>
      <p>
        Do not confuse that with LinkedIn Sponsored Content bought directly in Campaign Manager. A
        company-page ad is media purchased from LinkedIn. A creator deal is a commercial
        relationship with the person writing the post.
      </p>
      <p>
        LinkedIn's current help page says a post shared in exchange for value must use the{' '}
        <Ext href="https://www.linkedin.com/help/linkedin/answer/a1362316">
          brand-partnership label
        </Ext>{' '}
        and make the relationship clear, conspicuous and transparent.
      </p>

      <h2 id="define-the-sponsor-category-before-searching-for-companies">
        Define the sponsor category before searching for companies
      </h2>
      <p>
        The fastest way to make prospecting irrelevant is to begin with a list of brands. Begin
        with your audience instead. Write one sentence that contains: the job your readers do, the
        recurring problem they trust you to discuss, the product categories that can genuinely help
        with that problem, and the categories you will not promote.
      </p>
      <p>
        “I write about sales” is too broad to guide a sponsor search. “I help early-stage sales
        leaders build outbound systems, so I can credibly test sales intelligence, sequencing, call
        coaching and CRM workflow products” produces a useful market.
      </p>

      <h2 id="make-your-linkedin-profile-easy-for-a-sponsor-to-evaluate">
        Make your LinkedIn profile easy for a sponsor to evaluate
      </h2>
      <p>
        A brand should be able to answer three questions from your profile and recent posts: who
        reads you, what you know and whether a product mention would feel native. You do not need a
        theatrical media kit. You do need:
      </p>
      <ul>
        <li>a headline that names your field and the people you help;</li>
        <li>recent posts concentrated in one recognisable lane;</li>
        <li>an About section that explains your experience without inflating it;</li>
        <li>a visible way to contact you;</li>
        <li>examples of useful conversations with people in the buyer roles you claim to reach.</li>
      </ul>

      <h2 id="build-a-sponsor-list-from-real-product-fit">Build a sponsor list from real product fit</h2>
      <p>The best starting points are already inside your work:</p>
      <h3>Products you use and understand</h3>
      <p>
        A genuine workflow creates the strongest pitch because the angle exists before the
        sponsorship. Remove any company you could not recommend after a proper trial.
      </p>
      <h3>Brands already educating your audience</h3>
      <p>
        Look at the companies publishing useful material in your niche, sponsoring relevant events
        or appearing in conversations your readers already join.
      </p>
      <h3>Sponsors working with adjacent creators</h3>
      <p>
        Public brand-partnership labels and disclosed sponsored posts reveal companies that already
        understand creator collaboration. Do not copy another creator's angle.
      </p>
      <h3>New launches with a specific audience problem</h3>
      <p>
        A launch is useful only when you can name the reader problem it solves. Keep the list
        deliberately small — research enough to write a distinct angle for every company.
      </p>

      <h2 id="find-the-person-who-can-actually-buy-the-post">
        Find the person who can actually buy the post
      </h2>
      <p>
        The right contact varies with company size, but the responsibility usually sits near
        creator partnerships, influencer marketing, brand, content, social, community or demand
        generation. Read the person's recent work before messaging.
      </p>

      <h2 id="pitch-an-angle-not-your-availability">Pitch an angle, not your availability</h2>
      <p>The strongest first message is short because the thinking happened before it.</p>
      <blockquote>
        I write for [specific audience] about [specific problem]. I have used or reviewed
        [product/context], and I would like to publish a post showing [concrete angle the audience
        can use]. If that fits your current priorities, I can send the proposed scope, fixed post
        fee and publication window.
      </blockquote>
      <p>
        Do not open with follower count, a menu of packages or “would love to collaborate.” Put
        supporting evidence behind the idea, not in front of it.
      </p>

      <h2 id="qualify-the-deal-before-discussing-copy">Qualify the deal before discussing copy</h2>
      <p>When a brand replies, move from interest to a written scope. Confirm:</p>
      <ul>
        <li>the product and audience;</li>
        <li>the claim the brand wants the reader to understand;</li>
        <li>the evidence available for that claim;</li>
        <li>the post format and publication window;</li>
        <li>who writes the post and what the brand may review;</li>
        <li>the fixed fee and payment trigger;</li>
        <li>disclosure requirements;</li>
        <li>usage, exclusivity and paid-amplification rights;</li>
        <li>the destination link and measurement the parties will inspect afterward.</li>
      </ul>
      <p>
        Price the post as a deliverable, not as a forecast of clicks, impressions, leads or
        revenue. On Naano, the creator sets a fixed fee per sponsored post and the brand sees that
        price before booking.
      </p>

      <h2 id="use-more-than-one-route-to-market">Use more than one route to market</h2>
      <p>
        Direct outreach is useful because you choose the product and propose the idea. Inbound
        becomes more likely when your profile and editorial lane are easy to evaluate. A creator
        marketplace is the third route — it can bring relevant briefs into one place and
        standardise the commercial workflow.
      </p>

      <h2 id="follow-up-without-turning-the-relationship-into-a-sequence">
        Follow up without turning the relationship into a sequence
      </h2>
      <p>
        A useful follow-up adds information: a sharper angle, a relevant post you published or a
        clearer window. Repeating “just checking in” does not make the proposal more valuable.
      </p>

      <h2 id="know-when-to-decline">Know when to decline</h2>
      <p>
        Decline when the brand asks you to hide the relationship, publish supplied copy as your
        opinion, guarantee performance, endorse a product you cannot evaluate or transfer broad
        usage rights without agreement.
      </p>

      <h2 id="your-next-brand-deal-should-begin-with-fit">
        Your next brand deal should begin with fit
      </h2>
      <p>
        Choose one category you can discuss from experience. Build a short list of products your
        audience genuinely needs. Write one distinct post angle for each, contact the actual
        programme owner and make the deliverable, fixed fee, disclosure and rights clear before
        drafting.
      </p>
      <p>
        If you want relevant B2B opportunities without running the entire sales and payment process
        yourself, <a href="/creators">join Naano as a creator</a>. You set your fixed price per
        sponsored post and choose the collaborations that fit your audience.
      </p>

      <p>
        <strong>Related reading</strong>
      </p>
      <ul>
        <li>
          <Ext href="https://naano.com/blog/get-paid-for-linkedin-posts-creator">
            How to get paid for LinkedIn posts
          </Ext>
        </li>
        <li>
          <Ext href="https://naano.com/blog/how-much-charge-sponsored-linkedin-post">
            How much to charge for a sponsored LinkedIn post
          </Ext>
        </li>
        <li>
          <Ext href="https://naano.com/blog/how-to-write-b2b-sponsored-post">
            How to write a B2B sponsored post
          </Ext>
        </li>
        <li>
          <Ext href="https://naano.com/blog/sponsored-post-brief-to-published-playbook">
            The seven days after accepting a sponsored post
          </Ext>
        </li>
      </ul>
    </>
  )
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'b2b-creator-campaign-tracking-template',
    category: 'CPL economics',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #0A66C2 100%)',
    title: 'B2B Creator Campaign Tracking Template (2026)',
    description:
      'A practical B2B creator campaign tracking template: UTM naming, per-post records, funnel stages, QA checks and a weekly decision rhythm.',
    author: alexis,
    minutes: 8,
    dateISO: '2026-09-01',
    dateLabel: '1 Sept 2026',
    toc: [
      { id: 'start-with-the-decision-then-choose-the-fields', label: 'Start with the decision, then choose the fields' },
      { id: 'the-copyable-campaign-data-dictionary', label: 'The copyable campaign data dictionary' },
      { id: 'use-one-utm-language-across-every-post', label: 'Use one UTM language across every post' },
      { id: 'separate-delivery-traffic-conversion-and-pipeline', label: 'Separate delivery, traffic, conversion and pipeline' },
      { id: 'run-qa-at-three-moments', label: 'Run QA at three moments' },
      { id: 'use-a-weekly-decision-table-not-a-leaderboard', label: 'Use a weekly decision table, not a leaderboard' },
      { id: 'keep-the-tracker-useful-after-the-campaign', label: 'Keep the tracker useful after the campaign' },
      { id: 'frequently-asked-questions', label: 'Frequently asked questions' },
    ],
    tags: [
      'creator campaign tracking',
      'influencer campaign template',
      'b2b creator attribution',
      'utm tracking',
      'creator marketing measurement',
    ],
    body: TrackingTemplateBody,
  },
  {
    slug: 'linkedin-sponsored-post-usage-rights',
    category: 'LinkedIn micro-creators',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #22D3EE 100%)',
    title: 'LinkedIn Sponsored Post Usage Rights (2026)',
    description:
      'A creator-side guide to LinkedIn sponsored-post usage rights: organic publication, paid amplification, edits, duration, territory and disclosure.',
    author: justine,
    minutes: 9,
    dateISO: '2026-09-01',
    dateLabel: '1 Sept 2026',
    toc: [
      { id: 'name-the-baseline-before-discussing-extras', label: 'Name the baseline before discussing extras' },
      { id: 'build-the-rights-matrix-before-you-quote', label: 'Build the rights matrix before you quote' },
      { id: 'linkedin-permission-and-commercial-permission-are-separate', label: 'LinkedIn permission and commercial permission are separate' },
      { id: 'price-the-scope-not-a-universal-multiplier', label: 'Price the scope, not a universal multiplier' },
      { id: 'control-edits-and-factual-claims', label: 'Control edits and factual claims' },
      { id: 'disclosure-survives-amplification-and-reuse', label: 'Disclosure survives amplification and reuse' },
      { id: 'write-the-approval-message-before-the-request-arrives', label: 'Write the approval message before the request arrives' },
      { id: 'close-the-term-deliberately', label: 'Close the term deliberately' },
      { id: 'frequently-asked-questions', label: 'Frequently asked questions' },
    ],
    tags: [
      'influencer usage rights',
      'linkedin sponsored post',
      'thought leader ads',
      'creator contract',
      'paid amplification',
    ],
    body: UsageRightsBody,
  },
  {
    slug: 'how-to-find-brand-deals-on-linkedin',
    category: 'LinkedIn micro-creators',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #22D3EE 100%)',
    title: 'How to Find Brand Deals on LinkedIn (2026)',
    description:
      'A practical system for B2B creators to find LinkedIn brand deals: build a sponsor list, pitch useful angles, qualify briefs and protect audience trust.',
    author: thomas,
    minutes: 9,
    dateISO: '2026-08-24',
    dateLabel: '24 Aug 2026',
    toc: [
      { id: 'first-know-what-a-linkedin-brand-deal-is', label: 'First, know what a LinkedIn brand deal is' },
      { id: 'define-the-sponsor-category-before-searching-for-companies', label: 'Define the sponsor category before searching for companies' },
      { id: 'make-your-linkedin-profile-easy-for-a-sponsor-to-evaluate', label: 'Make your LinkedIn profile easy for a sponsor to evaluate' },
      { id: 'build-a-sponsor-list-from-real-product-fit', label: 'Build a sponsor list from real product fit' },
      { id: 'find-the-person-who-can-actually-buy-the-post', label: 'Find the person who can actually buy the post' },
      { id: 'pitch-an-angle-not-your-availability', label: 'Pitch an angle, not your availability' },
      { id: 'qualify-the-deal-before-discussing-copy', label: 'Qualify the deal before discussing copy' },
      { id: 'use-more-than-one-route-to-market', label: 'Use more than one route to market' },
      { id: 'follow-up-without-turning-the-relationship-into-a-sequence', label: 'Follow up without turning the relationship into a sequence' },
      { id: 'know-when-to-decline', label: 'Know when to decline' },
      { id: 'your-next-brand-deal-should-begin-with-fit', label: 'Your next brand deal should begin with fit' },
    ],
    tags: [
      'linkedin brand deals',
      'linkedin sponsored posts',
      'creator sponsorships',
      'b2b creator',
      'creator outreach',
    ],
    body: FindBrandDealsBody,
  },
]

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug)
