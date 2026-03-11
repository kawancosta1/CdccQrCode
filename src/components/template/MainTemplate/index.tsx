import { Footer } from "../../Footer";
import { Nav } from "../../Nav";


type MainTemplateProps = {

      children: React.ReactNode;

}

export  function MainTemplate({children} : MainTemplateProps) {


  return (
    //assim que deixamos o footer sempre la embaixo
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    
        <Nav/>
        <main style={{ flex: 1 }}>
              {children}
        </main>
        <Footer/>
      
    </div>
  );
}