
export interface IMyHeading{
    children:string;
    headingcls:string;
}
export default function MyHeading({children,headingcls}:IMyHeading){
return(
    <h2 className={headingcls}>{children}</h2>
)
}