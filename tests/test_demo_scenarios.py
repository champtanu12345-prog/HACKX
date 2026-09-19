def test_list_demo_scenarios(client):
    res = client.get("/api/v1/demo/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) == 3
    ids = [s["id"] for s in scenarios]
    assert "scenario_a" in ids
    assert "scenario_b" in ids
    assert "scenario_c" in ids
    for s in scenarios:
        assert s["label"] == "SIMULATED DEMO DATA"


def test_get_demo_scenario_detail(client):
    # Test Scenario A
    res_a = client.get("/api/v1/demo/scenarios/scenario_a")
    assert res_a.status_code == 200
    sc_a = res_a.json()
    assert sc_a["id"] == "scenario_a"
    assert "satellite_observation" in sc_a
    assert "spill_detection" in sc_a
    assert "environment" in sc_a
    assert "drift_simulation" in sc_a
    assert "vessels" in sc_a
    assert "ground_truth" in sc_a
    assert sc_a["vessels"][0]["mmsi"] == "419000123"
    assert sc_a["vessels"][0]["suspicion_score"] > 90.0

    # Test Scenario B
    res_b = client.get("/api/v1/demo/scenarios/scenario_b")
    assert res_b.status_code == 200
    sc_b = res_b.json()
    assert len(sc_b["vessels"]) >= 3

    # Test Scenario C
    res_c = client.get("/api/v1/demo/scenarios/scenario_c")
    assert res_c.status_code == 200
    sc_c = res_c.json()
    for v in sc_c["vessels"]:
        assert v["suspicion_score"] < 40.0


def test_invalid_scenario_404(client):
    res = client.get("/api/v1/demo/scenarios/scenario_nonexistent")
    assert res.status_code == 404
