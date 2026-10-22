
export interface IMyInput {
  inpcls:string;
  handleChange:(e:React.InputEvent) => void 
  placeholder:string;
  name:string;
}

export default function MyInput({inpcls,handleChange,placeholder,name}:IMyInput){
return (
    <input className={inpcls} onChange={(e) => handleChange} placeholder={placeholder} name={name} />
)
}