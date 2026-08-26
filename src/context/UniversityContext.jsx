import { createContext,useContext,useEffect,useMemo,useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'
const UniversityContext=createContext(null),KEY='tlucs_active_university'
export function UniversityProvider({children}){const {user}=useAuth();const [universities,setUniversities]=useState([]),[activeUniversityId,setActive]=useState(()=>localStorage.getItem(KEY)||'');useEffect(()=>{api('/universities').then(x=>setUniversities(x.data))},[]);useEffect(()=>{if(!activeUniversityId&&user?.default_university_id)setActive(user.default_university_id)},[user,activeUniversityId]);function setActiveUniversityId(id){setActive(id);if(id)localStorage.setItem(KEY,id);else localStorage.removeItem(KEY)}const value=useMemo(()=>({universities,activeUniversityId,setActiveUniversityId,activeUniversity:universities.find(x=>x.id===activeUniversityId)}),[universities,activeUniversityId]);return <UniversityContext.Provider value={value}>{children}</UniversityContext.Provider>}
// oxlint-disable-next-line react/only-export-components
export const useUniversity=()=>useContext(UniversityContext)
