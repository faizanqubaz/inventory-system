
export interface IMyInput {
  id?:string;
  type?:string;
  inpcls:string;
  handleChange?:(e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?:string;
  name?:string;
  required?:Boolean
  value?:string;
}

export default function MyInput({inpcls,handleChange,placeholder,name,id,type,required,value}:IMyInput){
return (
    <input id={id} className={inpcls} onChange={ handleChange} placeholder={placeholder} name={name} type={type} value={value} />
)
}