// localDictionary.js

const localDictionary = [
  {
    id: 'loc-term-1',
    name: 'Affidavit',
    definition:
      'A written statement of facts voluntarily made under oath.',
    synonyms: ['Sworn Statement'],
    references: ['Deposition', 'Testimony'],
  },
  {
    id: 'loc-term-2',
    name: 'Tort',
    definition:
      'A civil wrong causing harm or loss, resulting in legal liability for the person who commits the tortious act.',
    synonyms: ['Civil Wrong'],
    references: ['Negligence', 'Strict Liability'],
  },
  {
    id: 'loc-term-3',
    name: 'Jurisdiction',
    definition:
      'The legal authority of a court to hear and decide a case.',
    synonyms: ['Authority', 'Competence'],
    references: ['Venue', 'Subject Matter Jurisdiction'],
  },
  {
    id: 'loc-term-4',
    name: 'Habeas Corpus',
    definition:
      'A judicial mandate to a prison official ordering that an inmate be brought to the court so it can be determined whether or not that person is imprisoned lawfully.',
    synonyms: ['Great Writ', 'Writ of Liberty'],
    references: ['Due Process', 'Detention'],
  },
  {
    id: 'loc-term-5',
    name: 'Consideration',
    definition:
      'A benefit which must be bargained for between the parties and is the essential reason for a party entering into a contract.',
    synonyms: ['Bargained-for Exchange'],
    references: ['Contract', 'Offer', 'Acceptance'],
  },
  {
    id: 'loc-term-6',
    name: 'Mens Rea',
    definition:
      'The mental element of a person’s intention to commit a crime; or knowledge that one’s action or lack of action would cause a crime to be committed.',
    synonyms: ['Criminal Intent'],
    references: ['Actus Reus', 'Criminal Liability'],
  },
  {
    id: 'loc-term-7',
    name: 'Actus Reus',
    definition:
      'The physical element of committing a crime, including a voluntary act or failure to act where required.',
    synonyms: ['Guilty Act'],
    references: ['Mens Rea', 'Criminal Liability'],
  },
  {
    id: 'loc-term-8',
    name: 'Stare Decisis',
    definition:
      'The legal principle of determining points in litigation according to precedent.',
    synonyms: ['Precedent', 'Binding Authority'],
    references: ['Ratio Decidendi', 'Common Law'],
  },
  {
    id: 'loc-term-9',
    name: 'Estoppel',
    definition:
      'A legal principle that prevents someone from arguing something contrary to a claim they previously made or accepted by their words or actions.',
    synonyms: [],
    references: ['Detrimental Reliance', 'Equity'],
  },
  {
    id: 'loc-term-10',
    name: 'Per Curiam',
    definition:
      'A court opinion issued in the name of the Court rather than specific judges.',
    synonyms: [],
    references: ['Opinion', 'Judicial Decision'],
  },
  {
    id: 'loc-term-11',
    name: 'Prima Facie',
    definition:
      'Based on first impression; accepted as correct until proved otherwise.',
    synonyms: ['On the Face of It', 'At First Glance'],
    references: ['Burden of Proof'],
  },
  {
    id: 'loc-term-12',
    name: 'Res Ipsa Loquitur',
    definition:
      'A doctrine in tort law that infers negligence from the very nature of an accident or injury.',
    synonyms: ['The Thing Speaks for Itself'],
    references: ['Tort', 'Negligence', 'Burden of Proof'],
  },
  {
    id: 'loc-term-13',
    name: 'Ultra Vires',
    definition:
      'Acts conducted beyond the scope of a corporation’s or agency’s powers.',
    synonyms: ['Beyond Authority'],
    references: ['Corporate Law', 'Contracts'],
  },
  {
    id: 'loc-term-14',
    name: 'Writ of Certiorari',
    definition:
      'An order by which a higher court reviews a decision of a lower court.',
    synonyms: ['Cert Petition'],
    references: ['Supreme Court', 'Appeal'],
  },
  {
    id: 'loc-term-15',
    name: 'En Banc',
    definition:
      'Refers to court sessions with the entire membership of a court participating, rather than the usual quorum.',
    synonyms: [],
    references: ['Appeals Court', 'Panel'],
  },
  {
    id: 'loc-term-16',
    name: 'Voir Dire',
    definition:
      'A process of questioning prospective jurors to determine their qualifications and biases.',
    synonyms: ['Jury Selection'],
    references: ['Trial Procedure'],
  },
  {
    id: 'loc-term-17',
    name: 'Amicus Curiae',
    definition:
      'A person or organization that is not a party to a legal case but offers information that bears on the case.',
    synonyms: ['Friend of the Court'],
    references: ['Brief', 'Litigation'],
  },
  {
    id: 'loc-term-18',
    name: 'Equity',
    definition:
      'A branch of law developed alongside common law, concerned with fairness and justice, often providing remedies not available at common law.',
    synonyms: ['Fairness', 'Chancery'],
    references: ['Injunction', 'Specific Performance'],
  },
  {
    id: 'loc-term-19',
    name: 'Indemnify',
    definition:
      'To compensate for harm or loss, or to secure against legal responsibility for one’s actions.',
    synonyms: ['Hold Harmless', 'Reimburse'],
    references: ['Insurance', 'Liability'],
  },
  {
    id: 'loc-term-20',
    name: 'Force Majeure',
    definition:
      'A clause in contracts that frees both parties from obligation if an extraordinary event or circumstance beyond their control occurs.',
    synonyms: ['Act of God'],
    references: ['Contract', 'Liability'],
  },
  {
    id: 'loc-term-21',
    name: 'Burden of Proof',
    definition:
      'The obligation to prove one’s assertion, typically rests with the party who brings a claim.',
    synonyms: ['Onus Probandi'],
    references: ['Prima Facie', 'Standard of Proof'],
  },
  {
    id: 'loc-term-22',
    name: 'Standard of Proof',
    definition:
      'The level of certainty and the degree of evidence necessary to establish proof in a criminal or civil proceeding.',
    synonyms: ['Evidentiary Threshold'],
    references: ['Preponderance of Evidence', 'Beyond a Reasonable Doubt'],
  },
  // 200 additional legal terms:
  {
    id: 'loc-term-23',
    name: 'Adjudication',
    definition:
      'The legal process of resolving a dispute; the process by which a judge reviews evidence and argumentation to make a decision.',
    synonyms: ['Judgment', 'Resolution'],
    references: ['Trial', 'Court Decision'],
  },
  {
    id: 'loc-term-24',
    name: 'Affirmative Defense',
    definition:
      'A defense in which the defendant introduces evidence which, if found credible, negates criminal or civil liability even if the alleged acts occurred.',
    synonyms: ['Justification', 'Excuse'],
    references: ['Defense', 'Burden of Proof'],
  },
  {
    id: 'loc-term-25',
    name: 'Amendment',
    definition:
      'A formal change or addition proposed or made to a legal document, contract, or the constitution.',
    synonyms: ['Modification', 'Alteration'],
    references: ['Constitution', 'Legislation'],
  },
  {
    id: 'loc-term-26',
    name: 'Annulment',
    definition:
      'A legal procedure declaring a marriage null and void or a contract invalid.',
    synonyms: ['Invalidation'],
    references: ['Marriage Law', 'Contract Law'],
  },
  {
    id: 'loc-term-27',
    name: 'Appeal',
    definition:
      'A process in which a higher court reviews the decision of a lower court.',
    synonyms: ['Review', 'Reconsideration'],
    references: ['Appellate Court', 'Judicial Review'],
  },
  {
    id: 'loc-term-28',
    name: 'Appellate',
    definition:
      'Relating to appeals or the process of appealing a decision in a legal case.',
    synonyms: ['Review', 'Appeal-related'],
    references: ['Appeal', 'Court of Appeals'],
  },
  {
    id: 'loc-term-29',
    name: 'Arbitration',
    definition:
      'A method of dispute resolution involving a neutral third party who renders a binding decision.',
    synonyms: ['Mediation', 'Alternative Dispute Resolution'],
    references: ['Contract', 'Settlement'],
  },
  {
    id: 'loc-term-30',
    name: 'Bail',
    definition:
      'The temporary release of an accused person awaiting trial, sometimes on condition that money is deposited to guarantee appearance in court.',
    synonyms: ['Bond'],
    references: ['Criminal Law', 'Pretrial'],
  },
  {
    id: 'loc-term-31',
    name: 'Bill of Rights',
    definition:
      'A formal declaration of the fundamental rights and liberties of individuals.',
    synonyms: ['Charter of Rights'],
    references: ['Constitution', 'Human Rights'],
  },
  {
    id: 'loc-term-32',
    name: 'Brief',
    definition:
      'A written document presented to a court arguing why one party should prevail.',
    synonyms: ['Memorandum', 'Legal Argument'],
    references: ['Appellate', 'Case Law'],
  },
  {
    id: 'loc-term-33',
    name: 'Burden of Persuasion',
    definition:
      'The obligation to convince the fact-finder to a certain standard of proof.',
    synonyms: ['Persuasive Burden'],
    references: ['Standard of Proof', 'Evidence'],
  },
  {
    id: 'loc-term-34',
    name: 'Case Law',
    definition:
      'Law established by the outcome of former cases rather than through legislative statutes.',
    synonyms: ['Precedent'],
    references: ['Judicial Decisions', 'Common Law'],
  },
  {
    id: 'loc-term-35',
    name: 'Cause of Action',
    definition:
      'A set of facts sufficient to justify a right to sue to obtain a remedy.',
    synonyms: ['Legal Claim'],
    references: ['Tort', 'Contract'],
  },
  {
    id: 'loc-term-36',
    name: 'Certiorari',
    definition:
      'A writ or order by which a higher court reviews a decision of a lower court.',
    synonyms: ['Writ of Review'],
    references: ['Supreme Court', 'Appeal'],
  },
  {
    id: 'loc-term-37',
    name: 'Chattel',
    definition:
      'Movable personal property that is subject to ownership rights.',
    synonyms: ['Personal Property'],
    references: ['Property Law', 'Asset'],
  },
  {
    id: 'loc-term-38',
    name: 'Circumstantial Evidence',
    definition:
      'Evidence that relies on an inference to connect it to a conclusion of fact.',
    synonyms: ['Indirect Evidence'],
    references: ['Evidence', 'Trial'],
  },
  {
    id: 'loc-term-39',
    name: 'Citation',
    definition:
      'A reference to a legal precedent or authority in a written argument.',
    synonyms: ['Reference', 'Legal Authority'],
    references: ['Case Law', 'Statute'],
  },
  {
    id: 'loc-term-40',
    name: 'Common Law',
    definition:
      'Law derived from judicial decisions and customs rather than statutes.',
    synonyms: ['Case Law'],
    references: ['Judicial Precedent', 'Equity'],
  },
  {
    id: 'loc-term-41',
    name: 'Compensatory Damages',
    definition:
      'Monetary damages awarded to compensate for actual losses suffered.',
    synonyms: ['Restitution', 'Reparation'],
    references: ['Tort', 'Contract'],
  },
  {
    id: 'loc-term-42',
    name: 'Constitution',
    definition:
      'A set of fundamental principles or established precedents according to which a state is governed.',
    synonyms: ['Charter', 'Fundamental Law'],
    references: ['Bill of Rights', 'Judicial Review'],
  },
  {
    id: 'loc-term-43',
    name: 'Contempt of Court',
    definition:
      'Behavior that disrespects the court or obstructs the administration of justice.',
    synonyms: ['Disrespect'],
    references: ['Judicial Authority', 'Legal Sanctions'],
  },
  {
    id: 'loc-term-44',
    name: 'Contract',
    definition:
      'A legally enforceable agreement between two or more parties.',
    synonyms: ['Agreement', 'Covenant'],
    references: ['Consideration', 'Offer', 'Acceptance'],
  },
  {
    id: 'loc-term-45',
    name: 'Counterclaim',
    definition:
      'A claim made to offset another claim, typically filed by a defendant in a lawsuit.',
    synonyms: ['Set-off'],
    references: ['Litigation', 'Defense'],
  },
  {
    id: 'loc-term-46',
    name: 'Covenant',
    definition:
      'A formal agreement or promise in a contract or deed.',
    synonyms: ['Agreement', 'Pledge'],
    references: ['Contract', 'Real Estate'],
  },
  {
    id: 'loc-term-47',
    name: 'Damages',
    definition:
      'Monetary compensation awarded to a party for loss or injury.',
    synonyms: ['Compensation', 'Reparation'],
    references: ['Tort', 'Contract'],
  },
  {
    id: 'loc-term-48',
    name: 'Declaratory Judgment',
    definition:
      'A judgment of a court that determines the rights of parties without ordering any specific action or awarding damages.',
    synonyms: ['Judicial Declaration'],
    references: ['Litigation', 'Contract Law'],
  },
  {
    id: 'loc-term-49',
    name: 'Decree',
    definition:
      'An official order issued by a legal authority.',
    synonyms: ['Order', 'Mandate'],
    references: ['Judicial Decision', 'Administrative Law'],
  },
  {
    id: 'loc-term-50',
    name: 'Defamation',
    definition:
      'The act of damaging someone’s good reputation through false statements.',
    synonyms: ['Slander', 'Libel'],
    references: ['Tort', 'Civil Law'],
  },
  {
    id: 'loc-term-51',
    name: 'Default Judgment',
    definition:
      'A judgment entered against a party who fails to take action, such as not responding to a lawsuit.',
    synonyms: ['Inaction Judgment'],
    references: ['Litigation', 'Court Order'],
  },
  {
    id: 'loc-term-52',
    name: 'Defendant',
    definition:
      'An individual or entity against whom a legal proceeding is brought.',
    synonyms: ['Accused', 'Respondent'],
    references: ['Criminal Law', 'Civil Litigation'],
  },
  {
    id: 'loc-term-53',
    name: 'Deliberation',
    definition:
      'The process by which a jury or judge considers the evidence and arguments in a case before reaching a verdict.',
    synonyms: ['Consideration', 'Reflection'],
    references: ['Jury', 'Judgment'],
  },
  {
    id: 'loc-term-54',
    name: 'Deposition',
    definition:
      'A witness’s sworn out-of-court testimony, used to gather information as part of the discovery process.',
    synonyms: ['Testimony', 'Sworn Statement'],
    references: ['Discovery', 'Trial'],
  },
  {
    id: 'loc-term-55',
    name: 'Discovery',
    definition:
      'The pre-trial process in which parties obtain evidence from one another.',
    synonyms: ['Evidence Gathering'],
    references: ['Litigation', 'Deposition'],
  },
  {
    id: 'loc-term-56',
    name: 'Docket',
    definition:
      'A schedule of cases to be heard by a court.',
    synonyms: ['Calendar', 'Case List'],
    references: ['Court Schedule', 'Judicial Administration'],
  },
  {
    id: 'loc-term-57',
    name: 'Double Jeopardy',
    definition:
      'A legal principle that prevents an individual from being tried twice for the same offense.',
    synonyms: ['Multiple Prosecutions'],
    references: ['Criminal Law', 'Constitution'],
  },
  {
    id: 'loc-term-58',
    name: 'Due Process',
    definition:
      'The legal requirement that the state must respect all legal rights owed to a person.',
    synonyms: ['Fair Procedure'],
    references: ['Constitution', 'Civil Rights'],
  },
  {
    id: 'loc-term-59',
    name: 'Easement',
    definition:
      "A right to cross or otherwise use someone else's land for a specified purpose.",
    synonyms: ['Right of Way'],
    references: ['Property Law', 'Real Estate'],
  },
  {
    id: 'loc-term-60',
    name: 'Embezzlement',
    definition:
      "The fraudulent appropriation of funds or property entrusted to one's care.",
    synonyms: ['Misappropriation'],
    references: ['Criminal Law', 'Fraud'],
  },
  {
    id: 'loc-term-61',
    name: 'Enforcement',
    definition:
      'The act of compelling compliance with laws, rules, or obligations.',
    synonyms: ['Implementation', 'Execution'],
    references: ['Law Enforcement', 'Judicial Process'],
  },
  {
    id: 'loc-term-62',
    name: 'Equitable Estoppel',
    definition:
      'A legal principle that prevents a party from taking a legal position contrary to its previous actions or statements.',
    synonyms: ['Preclusion'],
    references: ['Estoppel', 'Equity'],
  },
  {
    id: 'loc-term-63',
    name: 'Ex Parte',
    definition:
      'Legal proceedings conducted for the benefit of one party without the presence of the opposing party.',
    synonyms: ['One-sided'],
    references: ['Injunction', 'Temporary Orders'],
  },
  {
    id: 'loc-term-64',
    name: 'Exclusionary Rule',
    definition:
      'A rule that prohibits the use of illegally obtained evidence in a court of law.',
    synonyms: ['Evidence Suppression'],
    references: ['Criminal Procedure', 'Due Process'],
  },
  {
    id: 'loc-term-65',
    name: 'Expert Witness',
    definition:
      'An individual with specialized knowledge who testifies in court to provide opinions on technical matters.',
    synonyms: ['Specialist', 'Authority'],
    references: ['Trial', 'Testimony'],
  },
  {
    id: 'loc-term-66',
    name: 'Felony',
    definition:
      'A serious crime typically punishable by imprisonment for more than one year or by death.',
    synonyms: ['Serious Crime'],
    references: ['Criminal Law', 'Indictment'],
  },
  {
    id: 'loc-term-67',
    name: 'Finding',
    definition:
      'A determination or conclusion reached by a fact-finder or judge after considering the evidence.',
    synonyms: ['Determination', 'Conclusion'],
    references: ['Judgment', 'Verdict'],
  },
  {
    id: 'loc-term-68',
    name: 'Foreseeability',
    definition:
      'The predictability of harm or injury as a result of a particular action.',
    synonyms: ['Predictability'],
    references: ['Negligence', 'Tort Law'],
  },
  {
    id: 'loc-term-69',
    name: 'Fraud',
    definition:
      'Intentional deception made for personal gain or to damage another individual.',
    synonyms: ['Deceit', 'Misrepresentation'],
    references: ['Tort', 'Criminal Law'],
  },
  {
    id: 'loc-term-70',
    name: 'Hearsay',
    definition:
      'An out-of-court statement offered to prove the truth of the matter asserted, generally inadmissible as evidence.',
    synonyms: ['Secondhand Evidence'],
    references: ['Evidence', 'Trial Procedure'],
  },
  {
    id: 'loc-term-71',
    name: 'In Camera',
    definition:
      'A legal proceeding or review conducted in private, typically by a judge.',
    synonyms: ['Private Review'],
    references: ['Judicial Process', 'Confidentiality'],
  },
  {
    id: 'loc-term-72',
    name: 'Injunction',
    definition:
      'A court order requiring a party to do or refrain from doing specific acts.',
    synonyms: ['Court Order', 'Mandate'],
    references: ['Equity', 'Legal Remedy'],
  },
  {
    id: 'loc-term-73',
    name: 'In Rem',
    definition:
      'A legal action directed toward property rather than a person.',
    synonyms: ['Property Action'],
    references: ['Property Law', 'Legal Proceedings'],
  },
  {
    id: 'loc-term-74',
    name: 'Indictment',
    definition:
      'A formal charge or accusation of a serious crime.',
    synonyms: ['Charge', 'Accusation'],
    references: ['Grand Jury', 'Criminal Law'],
  },
  {
    id: 'loc-term-75',
    name: 'Infraction',
    definition:
      'A violation or infringement of a law or regulation, typically minor.',
    synonyms: ['Violation'],
    references: ['Criminal Law', 'Misdemeanor'],
  },
  {
    id: 'loc-term-76',
    name: 'Interrogatories',
    definition:
      'A set of written questions required to be answered by parties to a lawsuit as part of discovery.',
    synonyms: ['Written Questions'],
    references: ['Discovery', 'Civil Procedure'],
  },
  {
    id: 'loc-term-77',
    name: 'Interpleader',
    definition:
      'A legal procedure allowing a plaintiff holding property to force competing claims to be resolved in court.',
    synonyms: ['Legal Action'],
    references: ['Litigation', 'Dispute Resolution'],
  },
  {
    id: 'loc-term-78',
    name: 'Intestate',
    definition:
      'Dying without having made a valid will.',
    synonyms: ['Will-less'],
    references: ['Estate Law', 'Succession'],
  },
  {
    id: 'loc-term-79',
    name: 'Joinder',
    definition:
      'The process of adding a party to an ongoing legal proceeding.',
    synonyms: ['Inclusion'],
    references: ['Civil Procedure', 'Litigation'],
  },
  {
    id: 'loc-term-80',
    name: 'Judgment',
    definition:
      'The final decision of a court resolving the issues in a legal case.',
    synonyms: ['Decision', 'Ruling'],
    references: ['Verdict', 'Appeal'],
  },
  {
    id: 'loc-term-81',
    name: 'Jurisprudence',
    definition:
      'The study or philosophy of law, or a body of legal decisions.',
    synonyms: ['Legal Theory', 'Philosophy of Law'],
    references: ['Case Law', 'Legal Studies'],
  },
  {
    id: 'loc-term-82',
    name: 'Jury',
    definition:
      'A group of citizens sworn to render a verdict in a legal case based on evidence presented in court.',
    synonyms: ['Panel', 'Tribunal'],
    references: ['Trial', 'Deliberation'],
  },
  {
    id: 'loc-term-83',
    name: 'Laches',
    definition:
      'An unreasonable delay in pursuing a legal right, which may result in a loss of that right.',
    synonyms: ['Delay'],
    references: ['Equity', 'Estoppel'],
  },
  {
    id: 'loc-term-84',
    name: 'Law',
    definition:
      'A system of rules created and enforced through social or governmental institutions to regulate behavior.',
    synonyms: ['Legislation', 'Statute'],
    references: ['Legal System', 'Judicial Authority'],
  },
  {
    id: 'loc-term-85',
    name: 'Legal Brief',
    definition:
      'A written argument presented to a court outlining the legal reasons for a party’s position.',
    synonyms: ['Memorandum', 'Argument'],
    references: ['Brief', 'Appellate'],
  },
  {
    id: 'loc-term-86',
    name: 'Liability',
    definition:
      'Legal responsibility for one’s actions or omissions.',
    synonyms: ['Responsibility', 'Accountability'],
    references: ['Tort', 'Contract'],
  },
  {
    id: 'loc-term-87',
    name: 'Lien',
    definition:
      "A legal right or interest that a creditor has in another's property, lasting until a debt or duty is satisfied.",
    synonyms: ['Claim'],
    references: ['Property Law', 'Security'],
  },
  {
    id: 'loc-term-88',
    name: 'Litigation',
    definition:
      'The process of taking legal action or resolving disputes in court.',
    synonyms: ['Lawsuit', 'Legal Proceedings'],
    references: ['Court', 'Trial'],
  },
  {
    id: 'loc-term-89',
    name: 'Malfeasance',
    definition:
      "The performance of a public official's duties in an illegal or unethical manner.",
    synonyms: ['Misconduct'],
    references: ['Public Law', 'Ethics'],
  },
  {
    id: 'loc-term-90',
    name: 'Mandamus',
    definition:
      'A judicial writ issued as a command to an inferior court or public official to perform a mandatory duty.',
    synonyms: ['Writ', 'Command'],
    references: ['Judicial Order', 'Public Duty'],
  },
  {
    id: 'loc-term-91',
    name: 'Mediation',
    definition:
      'A form of alternative dispute resolution in which a neutral third party assists the disputing parties in reaching a settlement.',
    synonyms: ['Conciliation'],
    references: ['Arbitration', 'Settlement'],
  },
  {
    id: 'loc-term-92',
    name: 'Misdemeanor',
    definition:
      'A less serious crime, usually punishable by a fine or a short term of imprisonment.',
    synonyms: ['Minor Offense'],
    references: ['Criminal Law', 'Infraction'],
  },
  {
    id: 'loc-term-93',
    name: 'Mitigation',
    definition:
      'The act of reducing the severity or harmful effects of something, such as damages or sentencing.',
    synonyms: ['Reduction', 'Alleviation'],
    references: ['Damages', 'Criminal Sentencing'],
  },
  {
    id: 'loc-term-94',
    name: 'Negligence',
    definition:
      'Failure to take proper care in doing something, resulting in damage or injury to another.',
    synonyms: ['Carelessness'],
    references: ['Tort', 'Duty of Care'],
  },
  {
    id: 'loc-term-95',
    name: 'Notary Public',
    definition:
      'An official authorized to perform certain legal formalities, especially to draw up or certify contracts, deeds, and other documents.',
    synonyms: ['Notary'],
    references: ['Authentication', 'Legal Formality'],
  },
  {
    id: 'loc-term-96',
    name: 'Nunc Pro Tunc',
    definition:
      'A Latin term meaning "now for then," referring to a court’s retroactive correction of a previous order.',
    synonyms: ['Retroactive Correction'],
    references: ['Judicial Order', 'Procedure'],
  },
  {
    id: 'loc-term-97',
    name: 'Oath',
    definition:
      "A solemn promise, often invoking a divine witness, regarding one’s future action or behavior.",
    synonyms: ['Swearing', 'Vow'],
    references: ['Affidavit', 'Testimony'],
  },
  {
    id: 'loc-term-98',
    name: 'Objection',
    definition:
      'An expression of disapproval or opposition, typically made during a trial to disallow inadmissible evidence or testimony.',
    synonyms: ['Protest', 'Challenge'],
    references: ['Trial', 'Court Procedure'],
  },
  {
    id: 'loc-term-99',
    name: 'Obligation',
    definition:
      'A legal or moral duty to do or not do something.',
    synonyms: ['Duty', 'Responsibility'],
    references: ['Contract', 'Tort'],
  },
  {
    id: 'loc-term-100',
    name: 'Opinion',
    definition:
      "A judge's written explanation of the legal reasoning behind a court’s decision.",
    synonyms: ['Ruling', 'Judgment'],
    references: ['Judicial Decision', 'Appellate'],
  },
  {
    id: 'loc-term-101',
    name: 'Ordinance',
    definition:
      'A law or regulation enacted by a municipal authority.',
    synonyms: ['Local Law', 'Bylaw'],
    references: ['Municipal Law', 'Legislation'],
  },
  {
    id: 'loc-term-102',
    name: 'Parole',
    definition:
      'The conditional release of a prisoner before the full sentence has been served.',
    synonyms: ['Early Release'],
    references: ['Criminal Justice', 'Correctional System'],
  },
  {
    id: 'loc-term-103',
    name: 'Patent',
    definition:
      'A government authority or license conferring a right or title, especially the sole right to exclude others from making, using, or selling an invention.',
    synonyms: ['License', 'Exclusive Right'],
    references: ['Intellectual Property', 'Innovation'],
  },
  {
    id: 'loc-term-104',
    name: 'Perjury',
    definition:
      'The offense of willfully telling an untruth or making a misrepresentation under oath.',
    synonyms: ['Lying under Oath'],
    references: ['Criminal Law', 'Testimony'],
  },
  {
    id: 'loc-term-105',
    name: 'Plaintiff',
    definition:
      'A person who brings a case against another in a court of law.',
    synonyms: ['Complainant', 'Claimant'],
    references: ['Civil Litigation', 'Lawsuit'],
  },
  {
    id: 'loc-term-106',
    name: 'Plea',
    definition:
      'A formal statement by or on behalf of a defendant, declaring guilt or innocence in response to a charge.',
    synonyms: ['Answer', 'Response'],
    references: ['Criminal Procedure', 'Trial'],
  },
  {
    id: 'loc-term-107',
    name: 'Precedent',
    definition:
      'A previous case or legal decision that may be or is relied upon when deciding subsequent cases with similar issues.',
    synonyms: ['Prior Decision'],
    references: ['Case Law', 'Stare Decisis'],
  },
  {
    id: 'loc-term-108',
    name: 'Preponderance of Evidence',
    definition:
      "The standard of proof in most civil cases, requiring that one side's evidence be more convincing than the other's.",
    synonyms: ['Greater Weight'],
    references: ['Burden of Proof', 'Civil Litigation'],
  },
  {
    id: 'loc-term-109',
    name: 'Probate',
    definition:
      "The legal process through which a deceased person’s will is validated and their estate is administered.",
    synonyms: ['Estate Administration'],
    references: ['Estate Law', 'Wills'],
  },
  {
    id: 'loc-term-110',
    name: 'Probable Cause',
    definition:
      'Reasonable grounds for making a search, pressing a charge, or taking other legal action.',
    synonyms: ['Justified Reason'],
    references: ['Criminal Procedure', 'Arrest'],
  },
  {
    id: 'loc-term-111',
    name: 'Procedure',
    definition:
      'The established or official way of doing something in the legal system.',
    synonyms: ['Process', 'Method'],
    references: ['Civil Procedure', 'Criminal Procedure'],
  },
  {
    id: 'loc-term-112',
    name: 'Prosecution',
    definition:
      'The legal party responsible for presenting the case against an individual accused of a crime.',
    synonyms: ['State', 'Crown'],
    references: ['Criminal Law', 'Trial'],
  },
  {
    id: 'loc-term-113',
    name: 'Provisional Sentence',
    definition:
      'A temporary sentence issued pending a final decision or appeal.',
    synonyms: ['Interim Sentence'],
    references: ['Criminal Law', 'Sentencing'],
  },
  {
    id: 'loc-term-114',
    name: 'Punitive Damages',
    definition:
      'Damages awarded to punish the defendant for particularly egregious behavior and deter future misconduct.',
    synonyms: ['Exemplary Damages'],
    references: ['Tort', 'Civil Litigation'],
  },
  {
    id: 'loc-term-115',
    name: 'Quid Pro Quo',
    definition:
      'A Latin term meaning "something for something," referring to an exchange where one transfer is contingent upon the other.',
    synonyms: ['Exchange', 'Reciprocity'],
    references: ['Contract', 'Negotiation'],
  },
  {
    id: 'loc-term-116',
    name: 'Quorum',
    definition:
      'The minimum number of members required for valid proceedings in an assembly or committee.',
    synonyms: ['Minimum Presence'],
    references: ['Legislative Procedure', 'Meetings'],
  },
  {
    id: 'loc-term-117',
    name: 'Recidivism',
    definition:
      'The tendency of a convicted criminal to reoffend.',
    synonyms: ['Repeat Offense'],
    references: ['Criminal Justice', 'Rehabilitation'],
  },
  {
    id: 'loc-term-118',
    name: 'Reckless',
    definition:
      'Acting without regard for the consequences, often leading to harm or legal liability.',
    synonyms: ['Careless', 'Hasty'],
    references: ['Negligence', 'Criminal Law'],
  },
  {
    id: 'loc-term-119',
    name: 'Remand',
    definition:
      'To send a case back to a lower court from a higher court for further action.',
    synonyms: ['Return', 'Reassign'],
    references: ['Appeal', 'Judicial Decision'],
  },
  {
    id: 'loc-term-120',
    name: 'Remedy',
    definition:
      'The means by which a court enforces a right, imposes a penalty, or orders a remedy.',
    synonyms: ['Relief', 'Solution'],
    references: ['Judicial Relief', 'Legal Action'],
  },
  {
    id: 'loc-term-121',
    name: 'Replevin',
    definition:
      'A legal action for the recovery of personal property wrongfully taken or retained.',
    synonyms: ['Recovery', 'Return Action'],
    references: ['Property Law', 'Civil Procedure'],
  },
  {
    id: 'loc-term-122',
    name: 'Rescission',
    definition:
      'The cancellation of a contract, aiming to restore the parties to their pre-contract positions.',
    synonyms: ['Cancellation'],
    references: ['Contract', 'Remedy'],
  },
  {
    id: 'loc-term-123',
    name: 'Restitution',
    definition:
      'The act of restoring or compensating for loss or injury, often through the return of property or money.',
    synonyms: ['Reimbursement', 'Compensation'],
    references: ['Damages', 'Contract Law'],
  },
  {
    id: 'loc-term-124',
    name: 'Retainer',
    definition:
      'A fee paid in advance to secure the services of a lawyer or other professional.',
    synonyms: ['Advance Payment'],
    references: ['Legal Services', 'Contract'],
  },
  {
    id: 'loc-term-125',
    name: 'Review',
    definition:
      'The process of re-examining a case or decision to determine if errors were made in applying the law.',
    synonyms: ['Reexamination'],
    references: ['Appeal', 'Judicial Process'],
  },
  {
    id: 'loc-term-126',
    name: 'Revocation',
    definition:
      'The formal cancellation or annulment of a decree, decision, or legal document.',
    synonyms: ['Cancellation', 'Rescission'],
    references: ['Contract', 'Legal Order'],
  },
  {
    id: 'loc-term-127',
    name: 'Sentence',
    definition:
      'The punishment assigned to a defendant who has been convicted of a crime.',
    synonyms: ['Punishment', 'Penalty'],
    references: ['Criminal Law', 'Judicial Decision'],
  },
  {
    id: 'loc-term-128',
    name: 'Sequestration',
    definition:
      'The isolation or removal of property or assets, often during a legal dispute.',
    synonyms: ['Isolation', 'Attachment'],
    references: ['Litigation', 'Judicial Order'],
  },
  {
    id: 'loc-term-129',
    name: 'Settlement',
    definition:
      'An agreement reached between parties to resolve a dispute without going to trial.',
    synonyms: ['Resolution', 'Agreement'],
    references: ['Negotiation', 'Litigation'],
  },
  {
    id: 'loc-term-130',
    name: 'Slander',
    definition:
      "The act of making a false spoken statement damaging to a person's reputation.",
    synonyms: ['Defamation'],
    references: ['Tort', 'Reputation'],
  },
  {
    id: 'loc-term-131',
    name: 'Solicitation',
    definition:
      'The act of seeking to obtain something; in law, often refers to encouraging someone to commit a crime.',
    synonyms: ['Enticement'],
    references: ['Criminal Law', 'Conspiracy'],
  },
  {
    id: 'loc-term-132',
    name: 'Statute',
    definition:
      'A written law passed by a legislative body.',
    synonyms: ['Legislation', 'Act'],
    references: ['Law', 'Regulation'],
  },
  {
    id: 'loc-term-133',
    name: 'Subpoena',
    definition:
      'A writ ordering a person to attend a court proceeding.',
    synonyms: ['Summons'],
    references: ['Legal Process', 'Court Order'],
  },
  {
    id: 'loc-term-134',
    name: 'Summons',
    definition:
      'A legal document issued by a court requiring a person to appear in court.',
    synonyms: ['Notice', 'Subpoena'],
    references: ['Court', 'Legal Process'],
  },
  {
    id: 'loc-term-135',
    name: 'Testimony',
    definition:
      'A formal written or spoken statement given in a court of law.',
    synonyms: ['Statement', 'Evidence'],
    references: ['Deposition', 'Trial'],
  },
  {
    id: 'loc-term-136',
    name: 'Testator',
    definition:
      'A person who has made a will or given a legacy.',
    synonyms: ['Will-Maker'],
    references: ['Estate Law', 'Wills'],
  },
  {
    id: 'loc-term-137',
    name: 'Tortfeasor',
    definition:
      'A person or entity that commits a tort.',
    synonyms: ['Wrongdoer'],
    references: ['Tort', 'Civil Liability'],
  },
  {
    id: 'loc-term-138',
    name: 'Trademark',
    definition:
      'A recognizable sign, design, or expression identifying products or services of a particular source.',
    synonyms: ['Brand'],
    references: ['Intellectual Property', 'Commercial Law'],
  },
  {
    id: 'loc-term-139',
    name: 'Transfer',
    definition:
      'The act of moving property or rights from one party to another.',
    synonyms: ['Conveyance', 'Assignment'],
    references: ['Contract', 'Property Law'],
  },
  {
    id: 'loc-term-140',
    name: 'Trespass',
    definition:
      "The unlawful entry onto someone else's property.",
    synonyms: ['Intrusion'],
    references: ['Property Law', 'Civil Wrong'],
  },
  {
    id: 'loc-term-141',
    name: 'Trust',
    definition:
      'A fiduciary relationship in which one party holds property for the benefit of another.',
    synonyms: ['Fiduciary Arrangement'],
    references: ['Estate Law', 'Property'],
  },
  {
    id: 'loc-term-142',
    name: 'Unconstitutional',
    definition:
      'Not in accordance with a political constitution, especially the U.S. Constitution.',
    synonyms: ['Illegitimate'],
    references: ['Constitution', 'Judicial Review'],
  },
  {
    id: 'loc-term-143',
    name: 'Undue Influence',
    definition:
      'Excessive pressure or influence that deprives someone of free will, especially in decision-making.',
    synonyms: ['Coercion'],
    references: ['Contract', 'Estate Law'],
  },
  {
    id: 'loc-term-144',
    name: 'Venue',
    definition:
      'The geographic location where a court case is heard.',
    synonyms: ['Location', 'Forum'],
    references: ['Jurisdiction', 'Trial'],
  },
  {
    id: 'loc-term-145',
    name: 'Verdict',
    definition:
      'The decision reached by a jury or judge in a trial.',
    synonyms: ['Decision', 'Judgment'],
    references: ['Trial', 'Jury'],
  },
  {
    id: 'loc-term-146',
    name: 'Warrant',
    definition:
      'A document issued by a legal or government official authorizing the police or another body to make an arrest, search premises, or carry out some other action.',
    synonyms: ['Authorization'],
    references: ['Arrest', 'Search'],
  },
  {
    id: 'loc-term-147',
    name: 'Warranty',
    definition:
      'A guarantee provided by a seller regarding the condition of a product or service.',
    synonyms: ['Guarantee'],
    references: ['Contract', 'Consumer Protection'],
  },
  {
    id: 'loc-term-148',
    name: 'Writ',
    definition:
      'A formal written order issued by a body with administrative or judicial jurisdiction.',
    synonyms: ['Order'],
    references: ['Court Order', 'Legal Process'],
  },
  {
    id: 'loc-term-149',
    name: 'Res Judicata',
    definition:
      'A matter that has been adjudicated by a competent court and may not be pursued further by the same parties.',
    synonyms: ['Claim Preclusion'],
    references: ['Final Judgment', 'Legal Preclusion'],
  },
  {
    id: 'loc-term-150',
    name: 'Quantum Meruit',
    definition:
      'A legal principle that a person should be paid for services rendered, even if no contract exists.',
    synonyms: ['As Much As Deserved'],
    references: ['Contract', 'Restitution'],
  },
  {
    id: 'loc-term-151',
    name: 'Constructive Trust',
    definition:
      'An equitable remedy resembling a trust imposed by a court to prevent unjust enrichment.',
    synonyms: ['Imputed Trust'],
    references: ['Equity', 'Unjust Enrichment'],
  },
  {
    id: 'loc-term-152',
    name: 'Bailment',
    definition:
      'A legal relationship in which physical possession of personal property is transferred from one person (the bailor) to another (the bailee) with the understanding that the property will be returned.',
    synonyms: ['Custody'],
    references: ['Property Law', 'Contract'],
  },
  {
    id: 'loc-term-153',
    name: 'Joint Venture',
    definition:
      'A business arrangement in which two or more parties agree to pool their resources for a specific task or business activity.',
    synonyms: ['Partnership'],
    references: ['Business Law', 'Contract'],
  },
  {
    id: 'loc-term-154',
    name: 'Partnership',
    definition:
      'A legal form of business operation in which two or more individuals share management and profits.',
    synonyms: ['Collaboration'],
    references: ['Business Law', 'Contract'],
  },
  {
    id: 'loc-term-155',
    name: 'Limited Liability Company',
    definition:
      'A corporate structure that provides limited liability to its owners while allowing pass-through taxation.',
    synonyms: ['LLC'],
    references: ['Business Law', 'Corporate Structure'],
  },
  {
    id: 'loc-term-156',
    name: 'Corporation',
    definition:
      'A legal entity that is separate and distinct from its owners, having many of the rights and responsibilities of an individual.',
    synonyms: ['Company', 'Incorporation'],
    references: ['Business Law', 'Corporate Law'],
  },
  {
    id: 'loc-term-157',
    name: 'Merger',
    definition:
      'The combination of two or more companies into a single entity.',
    synonyms: ['Consolidation'],
    references: ['Corporate Law', 'Business Transactions'],
  },
  {
    id: 'loc-term-158',
    name: 'Acquisition',
    definition:
      'The act of obtaining control of another company by purchasing its shares or assets.',
    synonyms: ['Takeover'],
    references: ['Corporate Law', 'Business Transactions'],
  },
  {
    id: 'loc-term-159',
    name: 'Dissolution',
    definition:
      'The process of officially ending the existence of a corporation or partnership.',
    synonyms: ['Termination'],
    references: ['Corporate Law', 'Business Law'],
  },
  {
    id: 'loc-term-160',
    name: 'Bankruptcy',
    definition:
      'A legal status of a person or entity that cannot repay debts owed to creditors.',
    synonyms: ['Insolvency'],
    references: ['Debt', 'Financial Law'],
  },
  {
    id: 'loc-term-161',
    name: 'Foreclosure',
    definition:
      "The legal process by which an owner's right to a property is terminated, usually due to default on a mortgage.",
    synonyms: ['Repossession'],
    references: ['Real Estate', 'Mortgage'],
  },
  {
    id: 'loc-term-162',
    name: 'Surety',
    definition:
      "A person who takes responsibility for another's performance of an undertaking, such as repaying a debt.",
    synonyms: ['Guarantor'],
    references: ['Contract', 'Bond'],
  },
  {
    id: 'loc-term-163',
    name: 'Guaranty',
    definition:
      'A formal promise to answer for the debt or default of another.',
    synonyms: ['Assurance'],
    references: ['Surety', 'Contract'],
  },
  {
    id: 'loc-term-164',
    name: 'Appeal Bond',
    definition:
      'A bond required by a court when a party appeals a judgment, ensuring payment of costs if the appeal fails.',
    synonyms: ['Surety Bond'],
    references: ['Appeal', 'Litigation'],
  },
  {
    id: 'loc-term-165',
    name: 'Arraignment',
    definition:
      'A court proceeding in which a defendant is formally charged and asked to respond by pleading guilty or not guilty.',
    synonyms: ['Charge Hearing'],
    references: ['Criminal Procedure', 'Trial'],
  },
  {
    id: 'loc-term-166',
    name: 'Bench Trial',
    definition:
      'A trial by judge, as opposed to a trial by jury.',
    synonyms: ['Non-Jury Trial'],
    references: ['Judicial Decision', 'Trial'],
  },
  {
    id: 'loc-term-167',
    name: 'Bench Warrant',
    definition:
      'A warrant issued by a judge for the arrest of a person who has disobeyed a court order.',
    synonyms: ['Judicial Warrant'],
    references: ['Court Order', 'Arrest'],
  },
  {
    id: 'loc-term-168',
    name: 'Cross-Examination',
    definition:
      'The questioning of a witness by the opposing party during a trial.',
    synonyms: ['Questioning'],
    references: ['Trial', 'Testimony'],
  },
  {
    id: 'loc-term-169',
    name: 'Deposition Notice',
    definition:
      'A formal notice to a witness to appear for a deposition.',
    synonyms: ['Notice', 'Summons for Deposition'],
    references: ['Discovery', 'Litigation'],
  },
  {
    id: 'loc-term-170',
    name: 'Discovery Request',
    definition:
      'A formal request made during the discovery process for information or documents relevant to a case.',
    synonyms: ['Request for Information'],
    references: ['Discovery', 'Litigation'],
  },
  {
    id: 'loc-term-171',
    name: 'Eminent Domain',
    definition:
      'The power of the government to take private property for public use, with compensation provided to the owner.',
    synonyms: ['Compulsory Purchase'],
    references: ['Property Law', 'Government Authority'],
  },
  {
    id: 'loc-term-172',
    name: 'Escheat',
    definition:
      'The reversion of property to the state when an owner dies without heirs or a will.',
    synonyms: ['Reversion'],
    references: ['Estate Law', 'Property Law'],
  },
  {
    id: 'loc-term-173',
    name: 'Federalism',
    definition:
      'The division of power between a central government and regional governments.',
    synonyms: ['Division of Power'],
    references: ['Constitution', 'Government Structure'],
  },
  {
    id: 'loc-term-174',
    name: 'Judicial Review',
    definition:
      'The power of a court to review the actions of the executive or legislative branches and declare them unconstitutional.',
    synonyms: ['Court Review'],
    references: ['Constitution', 'Checks and Balances'],
  },
  {
    id: 'loc-term-175',
    name: 'Jury Nullification',
    definition:
      'When a jury returns a verdict of “Not Guilty” despite evidence of guilt because they believe the law is unjust or improperly applied.',
    synonyms: ['Acquittal by Protest'],
    references: ['Jury', 'Trial'],
  },
  {
    id: 'loc-term-176',
    name: 'Malpractice',
    definition:
      'Improper, illegal, or negligent professional activity or treatment, especially by a medical or legal professional.',
    synonyms: ['Negligence'],
    references: ['Professional Liability', 'Tort'],
  },
  {
    id: 'loc-term-177',
    name: 'Mandate',
    definition:
      'An official order or commission to do something.',
    synonyms: ['Command', 'Order'],
    references: ['Judicial Order', 'Government'],
  },
  {
    id: 'loc-term-178',
    name: 'Minority Interest',
    definition:
      'The portion of a subsidiary not owned by the parent company.',
    synonyms: ['Non-controlling Interest'],
    references: ['Corporate Law', 'Business'],
  },
  {
    id: 'loc-term-179',
    name: 'Nolo Contendere',
    definition:
      'A plea by which a defendant in a criminal prosecution accepts conviction without admitting guilt.',
    synonyms: ['No Contest'],
    references: ['Criminal Law', 'Plea'],
  },
  {
    id: 'loc-term-180',
    name: 'Obiter Dictum',
    definition:
      "A judge's expression of opinion not essential to the decision and not establishing precedent.",
    synonyms: ['Side Note'],
    references: ['Judicial Opinion', 'Precedent'],
  },
  {
    id: 'loc-term-181',
    name: 'Procedural Due Process',
    definition:
      'The legal requirement that the state must respect all legal rights owed to a person, focusing on fair procedures.',
    synonyms: ['Fair Process'],
    references: ['Due Process', 'Constitution'],
  },
  {
    id: 'loc-term-182',
    name: 'Substantive Due Process',
    definition:
      'A principle allowing courts to protect certain fundamental rights from government interference, even if procedural protections are present.',
    synonyms: ['Fundamental Rights'],
    references: ['Due Process', 'Constitution'],
  },
  {
    id: 'loc-term-183',
    name: 'Summons and Complaint',
    definition:
      'The initial documents filed by a plaintiff to start a civil lawsuit, outlining the claims against the defendant.',
    synonyms: ['Lawsuit Initiation'],
    references: ['Litigation', 'Civil Procedure'],
  },
  {
    id: 'loc-term-184',
    name: 'Temporary Restraining Order',
    definition:
      'A short-term court order to prohibit an individual from taking a particular action until a hearing can be held.',
    synonyms: ['TRO'],
    references: ['Injunction', 'Emergency Relief'],
  },
  {
    id: 'loc-term-185',
    name: 'Venue Transfer',
    definition:
      'The legal process of moving a trial from one jurisdiction to another.',
    synonyms: ['Change of Venue'],
    references: ['Jurisdiction', 'Trial Procedure'],
  },
  {
    id: 'loc-term-186',
    name: 'Writ of Execution',
    definition:
      'A court order that directs law enforcement to carry out the judgment of a court.',
    synonyms: ['Execution Writ'],
    references: ['Judgment', 'Enforcement'],
  },
  {
    id: 'loc-term-187',
    name: 'Writ of Possession',
    definition:
      'A court order authorizing a landlord or buyer to take possession of property.',
    synonyms: ['Possession Order'],
    references: ['Property Law', 'Eviction'],
  },
  {
    id: 'loc-term-188',
    name: 'Arbitration Award',
    definition:
      'The decision rendered by an arbitrator or panel of arbitrators in an arbitration proceeding.',
    synonyms: ['Arbitration Decision'],
    references: ['Arbitration', 'Settlement'],
  },
  {
    id: 'loc-term-189',
    name: 'Certificate of Incorporation',
    definition:
      'A legal document filed with the state to legally document the creation of a corporation.',
    synonyms: ['Articles of Incorporation'],
    references: ['Corporate Law', 'Business Formation'],
  },
  {
    id: 'loc-term-190',
    name: 'Certified Check',
    definition:
      'A check guaranteed by a bank, ensuring that funds are available and reserved until the check is cashed.',
    synonyms: ['Bank Check'],
    references: ['Financial Instruments', 'Banking'],
  },
  {
    id: 'loc-term-191',
    name: 'Collateral Estoppel',
    definition:
      'A doctrine preventing the same issue from being relitigated between the same parties once it has been conclusively determined.',
    synonyms: ['Issue Preclusion'],
    references: ['Estoppel', 'Litigation'],
  },
  {
    id: 'loc-term-192',
    name: 'Continuing Jurisdiction',
    definition:
      'The ongoing authority of a court to make decisions on certain matters even after a case has concluded.',
    synonyms: ['Ongoing Authority'],
    references: ['Judicial Power', 'Appeal'],
  },
  {
    id: 'loc-term-193',
    name: 'Counsel',
    definition:
      'A lawyer or group of lawyers giving legal advice and representing clients in court.',
    synonyms: ['Attorney', 'Lawyer'],
    references: ['Legal Services', 'Representation'],
  },
  {
    id: 'loc-term-194',
    name: 'Cross-Claim',
    definition:
      'A claim brought by one defendant against another defendant in the same proceeding.',
    synonyms: ['Counterclaim'],
    references: ['Litigation', 'Defense'],
  },
  {
    id: 'loc-term-195',
    name: 'Declaratory Relief',
    definition:
      'A legal determination of the parties’ rights without ordering any specific action or awarding damages.',
    synonyms: ['Judicial Declaration'],
    references: ['Declaratory Judgment', 'Legal Remedy'],
  },
  {
    id: 'loc-term-196',
    name: 'Default',
    definition:
      'The failure to respond or appear in a legal proceeding, leading to a judgment by default.',
    synonyms: ['Inaction'],
    references: ['Default Judgment', 'Litigation'],
  },
  {
    id: 'loc-term-197',
    name: 'Detention',
    definition:
      'The act of holding someone in custody, often for legal reasons.',
    synonyms: ['Custody'],
    references: ['Habeas Corpus', 'Arrest'],
  },
  {
    id: 'loc-term-198',
    name: 'Disbarment',
    definition:
      'The removal of a lawyer from the bar, preventing them from practicing law.',
    synonyms: ['Expulsion'],
    references: ['Legal Ethics', 'Professional Conduct'],
  },
  {
    id: 'loc-term-199',
    name: 'Dissenting Opinion',
    definition:
      'An opinion in a legal case written by one or more judges expressing disagreement with the majority opinion.',
    synonyms: ['Minority Opinion'],
    references: ['Judicial Decision', 'Appeal'],
  },
  {
    id: 'loc-term-200',
    name: 'Domicile',
    definition:
      'The place where a person has their permanent primary residence to which they intend to return.',
    synonyms: ['Residence'],
    references: ['Personal Law', 'Jurisdiction'],
  },
  {
    id: 'loc-term-201',
    name: 'Enforcement Mechanism',
    definition:
      'A method or process used to ensure compliance with a legal obligation or court order.',
    synonyms: ['Implementation', 'Execution'],
    references: ['Judicial Process', 'Law Enforcement'],
  },
  {
    id: 'loc-term-202',
    name: 'Escrow',
    definition:
      'A financial arrangement where a third party holds and regulates payment of funds required for a transaction.',
    synonyms: ['Custodial Account'],
    references: ['Real Estate', 'Contracts'],
  },
  {
    id: 'loc-term-203',
    name: 'Exculpatory Clause',
    definition:
      'A clause in a contract that relieves one party from liability for harm caused to another party.',
    synonyms: ['Liability Waiver'],
    references: ['Contract', 'Risk Management'],
  },
  {
    id: 'loc-term-204',
    name: 'Fiduciary Duty',
    definition:
      'A legal obligation to act in the best interest of another party, typically arising in relationships of trust.',
    synonyms: ['Duty of Loyalty'],
    references: ['Corporate Law', 'Trust'],
  },
  {
    id: 'loc-term-205',
    name: 'Forfeiture',
    definition:
      'The loss of property or money as a penalty for wrongdoing, often imposed by law.',
    synonyms: ['Confiscation'],
    references: ['Criminal Law', 'Asset Recovery'],
  },
  {
    id: 'loc-term-206',
    name: 'Garnishment',
    definition:
      "A legal process through which a portion of a debtor's earnings is withheld for the payment of a debt.",
    synonyms: ['Wage Deduction'],
    references: ['Debt Collection', 'Civil Procedure'],
  },
  {
    id: 'loc-term-207',
    name: 'Impeachment',
    definition:
      'The process by which a legislative body charges a government official with misconduct.',
    synonyms: ['Indictment'],
    references: ['Government', 'Constitution'],
  },
  {
    id: 'loc-term-208',
    name: 'Injunctive Relief',
    definition:
      'A court-ordered act or prohibition against an act to prevent future harm or injustice.',
    synonyms: ['Injunction'],
    references: ['Equity', 'Legal Remedy'],
  },
  {
    id: 'loc-term-209',
    name: 'Involuntary Manslaughter',
    definition:
      'Unintentional killing resulting from recklessness or criminal negligence.',
    synonyms: ['Unintentional Killing'],
    references: ['Criminal Law', 'Homicide'],
  },
  {
    id: 'loc-term-210',
    name: 'Larceny',
    definition:
      'The unlawful taking of personal property with intent to permanently deprive the owner of it.',
    synonyms: ['Theft'],
    references: ['Criminal Law', 'Property Crime'],
  },
  {
    id: 'loc-term-211',
    name: 'Legal Malpractice',
    definition:
      'Professional negligence by a lawyer or legal professional that causes harm to a client.',
    synonyms: ['Attorney Negligence'],
    references: ['Professional Liability', 'Law'],
  },
  {
    id: 'loc-term-212',
    name: 'Minority Opinion',
    definition:
      'A judicial opinion that represents the views of one or more judges in disagreement with the majority.',
    synonyms: ['Dissent'],
    references: ['Judicial Decision', 'Appeal'],
  },
  {
    id: 'loc-term-213',
    name: 'Nuisance',
    definition:
      'An act, condition, or thing that is harmful or offensive to the public or to a particular individual.',
    synonyms: ['Annoyance', 'Interference'],
    references: ['Tort', 'Property Law'],
  },
  {
    id: 'loc-term-214',
    name: 'Per Se',
    definition:
      'By itself, or intrinsically; often used to denote an act that is inherently illegal.',
    synonyms: ['Inherently'],
    references: ['Legal Standard', 'Criminal Law'],
  },
  {
    id: 'loc-term-215',
    name: 'Preemption',
    definition:
      'The principle that higher authority laws override lower ones, such as federal law superseding state law.',
    synonyms: ['Supersession'],
    references: ['Constitution', 'Federal Law'],
  },
  {
    id: 'loc-term-216',
    name: 'Regulatory Compliance',
    definition:
      'Adherence to laws, regulations, guidelines, and specifications relevant to an organization or industry.',
    synonyms: ['Conformity'],
    references: ['Administrative Law', 'Corporate Law'],
  },
  {
    id: 'loc-term-217',
    name: 'Statutory Interpretation',
    definition:
      'The process by which courts interpret and apply legislation.',
    synonyms: ['Legal Interpretation'],
    references: ['Statute', 'Judicial Review'],
  },
  {
    id: 'loc-term-218',
    name: 'Procedural Posture',
    definition:
      'The current status or stage of a case in the legal process.',
    synonyms: ['Case Status'],
    references: ['Litigation', 'Procedure'],
  },
  {
    id: 'loc-term-219',
    name: 'Interim Relief',
    definition:
      'Temporary assistance or measures granted by a court until a final decision is reached.',
    synonyms: ['Temporary Relief'],
    references: ['Injunction', 'Legal Remedy'],
  },
  {
    id: 'loc-term-220',
    name: 'Quantum of Damages',
    definition:
      'The amount of money to be awarded as compensation for loss or injury.',
    synonyms: ['Damage Amount'],
    references: ['Tort', 'Civil Litigation'],
  },
  {
    id: 'loc-term-221',
    name: 'Final Judgment',
    definition:
      'The conclusive decision of a court that resolves all the issues in a case.',
    synonyms: ['Conclusive Ruling'],
    references: ['Judgment', 'Appeal'],
  },
  {
    id: 'loc-term-222',
    name: 'Statutory Construction',
    definition:
      'The process by which courts interpret and apply statutory law.',
    synonyms: ['Legal Interpretation'],
    references: ['Statute', 'Legislation'],
  },
];

export default localDictionary;
