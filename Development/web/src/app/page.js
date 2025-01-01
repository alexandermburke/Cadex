import CoolLayout from "@/components/CoolLayout";
import Hero from "@/components/Login";
import Main from "@/components/MainTool";
import Product from "@/components/Product";
import Benefits from "@/components/Home";

export default function Home() {

  return (
    <CoolLayout>
      <Main>
        <Hero />
      </Main >
    </CoolLayout>
  );
}
