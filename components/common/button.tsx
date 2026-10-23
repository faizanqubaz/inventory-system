export interface IMyButton{
type:"submit" | "reset" | "button";
btncls:string;
children:any;
handleClick?:(e:any) => void
disabled?:Boolean
}


export default function MyButton({btncls,children,handleClick,type}:IMyButton){
    return(
        <button type={type} onClick={handleClick} className={btncls}>{children}</button>
    )
}