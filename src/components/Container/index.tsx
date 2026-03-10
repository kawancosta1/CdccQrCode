import style from './style.module.css'


type ContainerProps = {

    // vai ser o tipo que o react aceita
  children:React.ReactNode;
}

export function Container({children} : ContainerProps){

    return <div className={style.container}>

    <div className={style.content}>

    {children}

    </div>

    </div>

}