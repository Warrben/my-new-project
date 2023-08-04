import { createClient } from "@supabase/supabase-js";

// Replace 'YOUR_PROJECT_URL' and 'YOUR_API_KEY' with your actual project URL and API key
const supabase = createClient(
  "https://dcqhpsfenxvhmnlpskaq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcWhwc2Zlbnh2aG1ubHBza2FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MDM5NjQ1OCwiZXhwIjoyMDA1OTcyNDU4fQ.mhEDGNoN_iZIs6lmczAsVLYq_BmfNcl6xV1-yagGAFA"
);

const userForm = document.getElementById("userForm");
const networthOutput = document.getElementById("networth");

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const assets = parseFloat(document.getElementById("assets").value);
  const liabilities = parseFloat(document.getElementById("liabilities").value);
  const volatility = parseFloat(document.getElementById("volatility").value);
  const riskFreeRate = parseFloat(
    document.getElementById("riskFreeRate").value
  );
  const tenure = parseFloat(document.getElementById("tenure").value);

  // Calculate net worth
  const networth = assets - liabilities;

  const callOptionPremium = blackScholesCallOptionPremium(
    assets,
    liabilities,
    volatility,
    riskFreeRate,
    tenure
  );

  const formData = {
    name,
    assets,
    liabilities,
    volatility,
    riskFreeRate,
    tenure,
    networth,
    callOptionPremium, // Add the call option premium to the formData object
  };

  try {
    // Insert the form data into the 'users' table
    const { data, error } = await supabase.from("users").insert([formData]);

    if (error) {
      console.error("Error inserting data:", error);
      alert("Error occurred while processing the form.");
    } else {
      console.log("Data inserted successfully:", data);
      alert("Form data has been successfully saved.");
      userForm.reset(); // Reset the form after successful submission

      // Update the networthOutput element with the calculated net worth and message
      const message = `Hi ${name}, For the option with asset value of $${assets} , exercise price of $${liabilities}, riskfree rate of $${riskFreeRate}, volatilit of $${volatility} and tenure of $${tenure}  The estimated call option premium is $${callOptionPremium}.`;
      networthOutput.textContent = message;
    }
  } catch (error) {
    console.error("Error occurred while processing the form:", error);
    alert("Error occurred while processing the form.");
  }
});

// Function to calculate the call option premium using the Black-Scholes formula
function blackScholesCallOptionPremium(
  S, // Current stock price (assets)
  X, // Strike price (liabilities)
  sigma, // Volatility
  r, // Risk-free rate
  T // Tenure (in years)
) {
  const d1 =
    (Math.log(S / X) + (r + 0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const callOptionPremium =
    S * cumulativeNormalDistribution(d1) -
    X * Math.exp(-r * T) * cumulativeNormalDistribution(d2);
  return callOptionPremium;
}

// Function to calculate the cumulative normal distribution
function cumulativeNormalDistribution(x) {
  // This function approximates the cumulative normal distribution
  const a1 = 0.31938153;
  const a2 = -0.356563782;
  const a3 = 1.781477937;
  const a4 = -1.821255978;
  const a5 = 1.330274429;
  const RSQRT2PI = 0.39894228040143267793994605993438;

  const k = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
  const cnd =
    RSQRT2PI *
    Math.exp(-0.5 * x * x) *
    (k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5)))));

  if (x > 0) {
    return 1.0 - cnd;
  } else {
    return cnd;
  }
}
