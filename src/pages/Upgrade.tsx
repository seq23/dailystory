import { PremiumUpgrade } from "@/components/PremiumUpgrade";

const Upgrade = () => {
  return (
    <PremiumUpgrade
      onBack={() => {
        window.history.pushState(null, '', '/');
        window.location.reload();
      }}
      onSubscribe={() => {}}
    />
  );
};

export default Upgrade;
