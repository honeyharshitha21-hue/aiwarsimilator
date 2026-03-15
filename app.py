from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/simulate", methods=["POST"])
def simulate():

    attacker = request.form["attacker"]
    defender = request.form["defender"]

    alliances = {
        "USA":["UK","Germany","France","Japan","South Korea"],
        "Russia":["China","Iran"],
        "China":["North Korea","Pakistan"],
        "India":["USA","France"],
        "Pakistan":["China"],
        "Iran":["Syria","Lebanon"],
        "Israel":["USA"],
        "North Korea":["China"],
        "South Korea":["USA","Japan"]
    }

    affected = []

    if attacker in alliances:
        affected += alliances[attacker]

    if defender in alliances:
        affected += alliances[defender]

    oilImpact = random.randint(30,80)
    tradeImpact = random.randint(20,70)
    gdpLoss = random.randint(10,50)

    risk = random.randint(0,100)

    if risk > 70:
        prediction = "High chance of global war escalation"
    elif risk > 40:
        prediction = "Regional war likely"
    else:
        prediction = "Limited conflict expected"

    direct_effects = [
        "Heavy military confrontation",
        "Air strikes and missile attacks",
        "Infrastructure destruction",
        "Civilian displacement"
    ]

    indirect_effects = [
        "Oil prices surge globally",
        "Trade routes disrupted",
        "Stock markets unstable",
        "Global food supply affected"
    ]

    timeline = [
        "Day 1: Initial strike",
        "Day 3: Counter attack",
        "Day 7: Allies begin joining",
        "Day 15: International sanctions",
        "Day 30: Global diplomatic negotiations"
    ]

    report = f"""
AI Strategic Analysis:

Conflict between {attacker} and {defender} could destabilize multiple regions.
Allied countries may join rapidly through military alliances.
Energy markets and trade supply chains will be affected globally.
"""

    return jsonify({
        "prediction": prediction,
        "oilImpact": oilImpact,
        "tradeImpact": tradeImpact,
        "gdpLoss": gdpLoss,
        "direct": direct_effects,
        "indirect": indirect_effects,
        "affectedCountries": affected,
        "timeline": timeline,
        "report": report,
        "risk": risk
    })


if __name__ == "__main__":
    app.run(debug=True)
