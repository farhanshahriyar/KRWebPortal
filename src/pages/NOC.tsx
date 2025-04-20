import NOCForm from "@/components/noc/NOCForm";
import NOCList from "@/components/noc/NOCList";

const NOC = () => {
  return (
    <div className="p-6 space-y-6">
      <NOCForm />
      <NOCList />
    </div>
  );
};

export default NOC;