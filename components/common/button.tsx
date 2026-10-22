export interface IMyButton{
btncls:'primary' | 'secondary' | 'danger';
children:string;
handleClick:() => void
}


export default function MyButton({btncls,children,handleClick}:IMyButton){
    return(
        <button onClick={handleClick} className={btncls}>{children}</button>
    )
}