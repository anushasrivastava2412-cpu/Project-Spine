import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {onAuthStateChanged,signOut,type User} from 'firebase/auth';
import {doc,onSnapshot,setDoc,deleteDoc} from 'firebase/firestore';
import {auth,db} from './firebase';
import {type Assessment,type HabitLog} from './model';
type Data={assessments:Assessment[];habits:HabitLog;draft:string};
const empty:Data={assessments:[],habits:{},draft:''};
const key='spine-session-v1';
function read():Data{try{const d=JSON.parse(sessionStorage.getItem(key)||'null');return d&&Array.isArray(d.assessments)&&d.habits?d:empty;}catch{return empty;}}
type Store={data:Data;user:User|null;loading:boolean;cloudReady:boolean;notice:string;setNotice:(s:string)=>void;saveAssessment:(a:Assessment)=>Promise<void>;toggleHabit:(day:string,id:string)=>Promise<void>;saveDraft:(draft:string)=>Promise<void>;clearData:()=>Promise<void>;logout:()=>Promise<void>;isProfessional:boolean};
const Context=createContext<Store>(null!);
export function StoreProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<Data>(read);const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true);const [cloudReady,setCloudReady]=useState(false);const [notice,setNotice]=useState('');const [isProfessional,setProfessional]=useState(false);
 useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setCloudReady(false);setProfessional(false);setLoading(false);if(u){setData(empty);sessionStorage.removeItem(key);u.getIdTokenResult().then(t=>setProfessional(t.claims.professional===true)).catch(()=>{});}}),[]);
 useEffect(()=>{if(!user?.emailVerified)return;return onSnapshot(doc(db,'families',user.uid),snap=>{setData(snap.exists()?snap.data() as Data:empty);setCloudReady(true);},()=>{setCloudReady(false);setNotice('Cloud storage is unavailable. Your changes have not been synced. Please try again.');});},[user]);
 async function save(next:Data){
  if(user){if(!user.emailVerified)throw new Error('Verify your parent account email before saving health information.');if(!cloudReady)throw new Error('Your saved data is still loading. Please try again.');await setDoc(doc(db,'families',user.uid),next);setData(next);}
  else {sessionStorage.setItem(key,JSON.stringify(next));setData(next);}
 }
 return <Context.Provider value={{data,user,loading,cloudReady,notice,setNotice,isProfessional,saveAssessment:async a=>save({...data,assessments:[a,...data.assessments].slice(0,24)}),toggleHabit:async(day,id)=>{const done=data.habits[day]||[];const habits={...data.habits,[day]:done.includes(id)?done.filter(x=>x!==id):[...done,id]};const dates=Object.keys(habits).sort().slice(-90);await save({...data,habits:Object.fromEntries(dates.map(d=>[d,habits[d]]))});},saveDraft:async draft=>save({...data,draft}),clearData:async()=>{if(user){await deleteDoc(doc(db,'families',user.uid));}sessionStorage.removeItem(key);setData(empty);},logout:async()=>{await signOut(auth);sessionStorage.removeItem(key);setData(empty);setCloudReady(false);}}}>{children}</Context.Provider>;
}
export const useStore=()=>useContext(Context);
export function errorMessage(error:unknown){const e=error as {code?:string;message?:string};const messages:Record<string,string>={'auth/invalid-credential':'The email or password is incorrect.','auth/email-already-in-use':'An account already exists for this email. Please sign in.','auth/weak-password':'Use a password with at least 12 characters.','auth/too-many-requests':'Too many attempts. Please wait a little and try again.','auth/network-request-failed':'Check your connection and try again.','permission-denied':'This action is unavailable for your account. Verify your email and try again.','auth/requires-recent-login':'Please sign out and sign back in before deleting your account.'};return messages[e.code||'']||e.message||'Something went wrong. Please try again.';}
