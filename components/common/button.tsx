export interface IMyButton{
type:"submit" | "reset" | "button";
btncls:string;
children:string;
handleClick?:() => void
}


export default function MyButton({btncls,children,handleClick,type}:IMyButton){
    return(
        <button type={type} onClick={handleClick} className={btncls}>{children}</button>
    )
}