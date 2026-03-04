import { Footer } from "../../Footer";
import { Nav } from "../../Nav";


type MainTemplateProps = {

      children: React.ReactNode;

}

export  function MainTemplate({children} : MainTemplateProps) {


  return (
    <>
    
        <Nav/>
              {children}
        <Footer/>
      
    </>
  );
}