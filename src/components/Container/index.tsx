import style from "./style.module.css";

type ContainerProps = {
  children: React.ReactNode;
};

export function Container({ children }: ContainerProps) {
  return (
    <div className={style.container}>
      <div className={style.content}>{children}</div>
    </div>
  );
}
