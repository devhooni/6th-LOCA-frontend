import GoogleReCaptcha, { GOOGLE_RECAPTCHA_SITE_KEY } from "./GoogleReCaptcha";

export { GOOGLE_RECAPTCHA_SITE_KEY };
export default function RobotCaptcha(props) {
  return <GoogleReCaptcha {...props} />;
}
