import dynamic from "next/dynamic";

const Test2 = dynamic(() => import("./components/Test2"), {
  ssr: false,
});

export default function TestsPage(props) {
  return <Test2 />;
}
