type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value?: any;
};

export const event = ({ action, category, label, value }: GTagEvent): void => {
  if (typeof window !== "undefined") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};
