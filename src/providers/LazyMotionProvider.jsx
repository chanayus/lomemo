import { LazyMotion } from "motion/react";

const motionFeatures = () => import("../utils/motionFeature").then((res) => res.default);

export const LazyMotionProvider = ({ children }) => {
  return <LazyMotion features={motionFeatures}>{children}</LazyMotion>;
};
