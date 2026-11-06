export type Answers = {
  nickname: string; age: number; grade: string; sport: string; previousInjury: string;
  pain: string; frequency: string; duration: string; severity: string; redFlags: string;
  screen: number; sitting: number; breaks: string; movement: number;
  weight: number; bag: number; straps: string; carrying: string; setup: string;
  sleep: number; sleepQuality: string; recovery: string; calcium: string; protein: string; meals: string; guardianConsent: boolean;
};
export const blankAnswers: Answers = {nickname:'',age:13,grade:'',sport:'',previousInjury:'',pain:'',frequency:'',duration:'',severity:'',redFlags:'',screen:2,sitting:4,breaks:'',movement:30,weight:45,bag:3,straps:'',carrying:'',setup:'',sleep:8,sleepQuality:'',recovery:'',calcium:'',protein:'',meals:'',guardianConsent:false};
export type Domain = {key:string;name:string;value:number;detail:string;action:string};
export type Profile = {category:'low'|'moderate'|'elevated'|'urgent';label:string;domains:Domain[];ratio:number;modelVersion:string;actions:Domain[]};
export type Assessment = {id:string;createdAt:string;answers:Answers;profile:Profile};
export type HabitLog = Record<string,string[]>;
export const modelVersion = 'SPINE exploratory v1.0';
export function validateStep(a:Answers, step:number):string|null {
  if(step===0){if(!a.guardianConsent)return 'Please involve a parent or guardian and confirm before continuing.'; if(!Number.isInteger(a.age)||a.age<10||a.age>16)return 'This assessment is designed for students aged 10–16.';if(!a.grade||!a.sport||!a.previousInjury)return 'Please answer each question before continuing.';}
  if(step===1){if(!a.pain||!a.redFlags)return 'Please answer the symptom and urgent symptom questions.';if(a.pain!=='none'&&(!a.frequency||!a.duration||!a.severity))return 'Please tell us how often, how long, and how much discomfort you have.';}
  if(step===2&&(!a.breaks||!Number.isFinite(a.screen)||a.screen<0||a.screen>16||!Number.isFinite(a.sitting)||a.sitting<0||a.sitting>16||!Number.isFinite(a.movement)||a.movement<0||a.movement>240))return 'Please check your daily hours, movement, and break frequency.';
  if(step===3){if(!Number.isFinite(a.weight)||a.weight<15||a.weight>200||!Number.isFinite(a.bag)||a.bag<0||a.bag>25)return 'Please enter a body weight of 15–200 kg and a bag weight of 0–25 kg.'; if(!a.straps||!a.carrying||!a.setup)return 'Please answer the backpack and study setup questions.';}
  if(step===4){if(!Number.isFinite(a.sleep)||a.sleep<2||a.sleep>16)return 'Please enter sleep between 2 and 16 hours.';if(!a.sleepQuality||!a.recovery||!a.calcium||!a.protein||!a.meals)return 'Please answer each recovery and food habit question.';}
  return null;
}
export function assess(a:Answers):Profile {
  for(let i=0;i<5;i++){const error=validateStep(a,i);if(error)throw new Error(error);}
  const ratio=Math.round(a.bag/a.weight*1000)/10;
  const hasPain=a.pain!=='none';
  const symptoms = hasPain ? Math.min(3,1+Number(a.frequency==='often')+Number(a.duration==='weeks'||a.severity==='severe')) : 0;
  const domains:Domain[]=[
    {key:'symptoms',name:'Symptoms',value:Math.max(symptoms,a.previousInjury==='yes'?1:0),detail:hasPain?'Notice when discomfort happens and share it with a trusted adult.':'No current discomfort reported. Keep listening to your body.',action:hasPain?'Talk to a parent about your discomfort':'Notice how your body feels'},
    {key:'backpack',name:'Backpack',value:Math.min(3,Number(ratio>10)+Number(ratio>15)+Number(a.straps==='one'||a.carrying==='long')),detail:`Your backpack is ${ratio}% of your body weight. Weight is one factor, not a diagnosis.`,action:'Check what you need in your school bag'},
    {key:'screen',name:'Screen & sitting',value:Math.min(3,Number(a.screen>=4)+Number(a.sitting>=6)+Number(a.breaks==='rare')),detail:'Long, uninterrupted sitting is a useful habit to review.',action:'Plan a short break between study sessions'},
    {key:'movement',name:'Movement',value:a.movement>=60?0:a.movement>=30?1:2,detail:'Build up enjoyable movement gradually, in ways that feel comfortable.',action:'Make time for movement you enjoy'},
    {key:'setup',name:'Study setup',value:a.setup==='comfortable'?0:a.setup==='mixed'?1:2,detail:'Try a comfortable setup and change position regularly.',action:'Make your study space more comfortable'},
    {key:'sleep',name:'Sleep & recovery',value:Math.min(3,Number(a.sleep<(a.age<=12?9:8))*2+Number(a.sleepQuality==='poor'||a.recovery==='rare')),detail:`For your age, general sleep guidance is ${a.age<=12?'9–12':'8–10'} hours. Individual needs vary.`,action:'Make room for a consistent bedtime'},
    {key:'nutrition',name:'Food habits',value:Math.min(3,Number(a.calcium==='rare')+Number(a.protein==='rare')+Number(a.meals==='irregular')),detail:'Regular, varied meals support general health. This does not test for deficiencies.',action:'Plan regular, varied meals with your family'},
  ];
  const total=domains.reduce((sum,d)=>sum+d.value,0);
  const needsReview=hasPain&&(a.severity==='severe'||a.duration==='weeks'||a.frequency==='often');
  const category = a.redFlags==='yes'?'urgent':needsReview||total>=12?'elevated':total>=5?'moderate':'low';
  const labels={low:'Low prevention risk',moderate:'Modify & monitor',elevated:'Professional attention',urgent:'Seek urgent medical help'};
  return {category,label:labels[category],domains,ratio,modelVersion,actions:[...domains].sort((x,y)=>y.value-x.value).slice(0,3)};
}
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function lastSevenDays(){return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return {key:localDay(d),label:d.toLocaleDateString('en',{weekday:'short'})};});}
export function reassessmentDate(createdAt:string){const d=new Date(createdAt);d.setDate(d.getDate()+28);return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
export const sampleAnswers:Answers={...blankAnswers,nickname:'Alex',grade:'8',sport:'sometimes',previousInjury:'no',pain:'none',redFlags:'no',breaks:'sometimes',straps:'two',carrying:'short',setup:'comfortable',sleepQuality:'good',recovery:'regular',calcium:'often',protein:'often',meals:'regular',guardianConsent:true};
