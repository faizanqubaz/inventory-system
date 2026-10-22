
export interface IMyInput {
  id?:string;
  type?:string;
  inpcls:string;
  handleChange?:(e:React.InputEvent) => void 
  placeholder?:string;
  name?:string;
  required?:Boolean
}

export default function MyInput({inpcls,handleChange,placeholder,name,id,type,required}:IMyInput){
return (
    <input id={id} className={inpcls} onChange={(e) => handleChange} placeholder={placeholder} name={name} type={type} required />
)
}