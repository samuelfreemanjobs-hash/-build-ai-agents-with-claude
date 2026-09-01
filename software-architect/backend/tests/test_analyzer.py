from software_architect.analyzer import ArchitectureAnalyzer

def test_validate_c4_pass():
    a = ArchitectureAnalyzer()
    r = a.validate_c4({"context": {"system_name": "X", "description": "Y"},
                       "containers": [{"id": "c1", "name": "API", "technology": "Py", "responsibility": "HTTP", "source_ref": "x"}]}, "T1")
    assert r["status"] == "PASS"
