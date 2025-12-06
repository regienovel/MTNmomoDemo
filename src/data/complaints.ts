// src/data/complaints.ts

export interface ComplaintExample {
  id: string;
  label: string;
  text: string;
}

export const COMPLAINT_EXAMPLES: ComplaintExample[] = [
  {
    id: "social-akos",
    label: "Kejetia trader – guided promo call (social engineering)",
    text: `Good evening. My name is Akos, I sell provisions at Kejetia. Last night around 9:45pm I got a call saying they are from "MTN Promotion Office" in Accra. They said I have won GHS 5,000 MoMo and I should not cut the call.

They told me to dial *170#, press some numbers and put in my PIN and a code they will send. I was confused but they said it is to confirm the prize. After the call my MoMo balance became almost zero. I did not send any money to anybody by myself.

This morning I checked my statement and saw four transfers to numbers in Accra and Kasoa that I don't know. Please this money is for my goods, I don't sleep again. I reported to MTN office in Adum but they said the transactions were done from my phone. I need help.`
  },
  {
    id: "sim-issah",
    label: "Tamale worker – no network then SIM swap cash-out",
    text: `Hello MTN, my name is Issah from Tamale. On Friday morning my MoMo line suddenly went off, no network, even when I restarted the phone. I thought it was normal network issue so I used my other line for the day.

In the evening I went to MTN office and they told me my SIM was already replaced earlier that day at Walewale. I never went to Walewale and I did not authorise anyone to do SIM swap for me.

When they printed my MoMo statement I saw that about GHS 5,400 was sent from my wallet to one number and quickly cashed out at an agent at Walewale lorry station. I did not do those transactions. Please this is my salary and remittances. I want MTN to investigate and refund.`
  },
  {
    id: "agent-error",
    label: "Madina customer – agent cash-out confusion",
    text: `Good afternoon. Yesterday at Madina market I went to a MoMo agent to withdraw GHS 800. I gave him my number and he processed the transaction. He gave me the cash but when I got home and checked my balance, it looked like more money had gone.

I later saw on my statement that he actually cashed out GHS 1,800 instead of 800. I complained to him on phone and he said the system shows 1,800 so there is nothing he can do. I feel the agent has cheated me or made a mistake and is refusing to refund the difference.

Please help me check the transaction and take action on that agent.`
  }
];
