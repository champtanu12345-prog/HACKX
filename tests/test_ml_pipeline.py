"""Unit tests for ML U-Net architecture, preprocessing, postprocessing, and inference pipeline."""

import pytest
import numpy as np

torch = pytest.importorskip("torch")

from ml.models.unet import UNet
from ml.preprocessing.preprocessor import SARImagePreprocessor
from ml.postprocessing.postprocessor import SpillPostprocessor
from ml.inference.pipeline import detect_oil_spill, SpillDetectionResult


def test_unet_architecture():
    """Verify standard U-Net model forward pass and output dimensions."""
    model = UNet(n_channels=1, n_classes=1)
    dummy_input = torch.randn(2, 1, 128, 128)
    output = model(dummy_input)

    assert output.shape == (2, 1, 128, 128)
    # Output must be sigmoid probabilities between 0 and 1
    assert torch.all(output >= 0.0)
    assert torch.all(output <= 1.0)


def test_sar_preprocessing():
    """Verify radiometric calibration, normalization, and resizing."""
    preprocessor = SARImagePreprocessor(target_size=(128, 128), min_db=-30.0, max_db=0.0)

    # 1. Calibrate synthetic digital numbers
    synthetic_dn = np.array([[10.0, 50.0], [100.0, 500.0]], dtype=np.float32)
    db = preprocessor.calibrate_to_decibels(synthetic_dn)
    assert db.shape == (2, 2)
    assert db[0, 0] == pytest.approx(10.0, rel=1e-2)  # 10*log10(10) = 10 dB

    # 2. Normalize to [0.0, 1.0]
    norm = preprocessor.normalize(np.array([-30.0, -15.0, 0.0], dtype=np.float32))
    assert norm[0] == pytest.approx(0.0)
    assert norm[1] == pytest.approx(0.5)
    assert norm[2] == pytest.approx(1.0)

    # 3. Full pipeline with synthetic image
    raw_img = np.random.uniform(50.0, 300.0, size=(200, 300)).astype(np.float32)
    tensor_input, raw_db, meta = preprocessor.preprocess(raw_img)
    assert tensor_input.shape == (1, 1, 128, 128)
    assert meta["orig_h"] == 200
    assert meta["orig_w"] == 300


def test_spill_postprocessing():
    """Verify thresholding, connected component filtering, centroid, area, and polygon extraction."""
    postprocessor = SpillPostprocessor(threshold=0.5, min_component_area_pixels=10, pixel_resolution_m=10.0)

    # Synthetic probability map with a simulated slick box (50x50 pixels = 2500 pixels)
    prob_map = np.zeros((100, 100), dtype=np.float32)
    prob_map[25:75, 25:75] = 0.95  # Simulated slick
    prob_map[10:12, 10:12] = 0.85  # Small isolated noise speck (4 pixels < min_component_area_pixels)

    binary_mask = postprocessor.threshold_mask(prob_map)
    assert binary_mask[30, 30] == 1
    assert binary_mask[11, 11] == 1

    cleaned_mask = postprocessor.filter_connected_components(binary_mask)
    # Primary slick should remain
    assert cleaned_mask[30, 30] == 1
    # Small noise speck should be eliminated
    assert cleaned_mask[11, 11] == 0

    metrics = postprocessor.compute_metrics(
        binary_mask=cleaned_mask,
        probability_map=prob_map,
        top_left_lat=19.50,
        top_left_lon=71.20,
    )

    assert metrics["detected"] is True
    assert metrics["area_sqkm"] > 0.0
    assert metrics["perimeter_km"] > 0.0
    assert len(metrics["centroid"]) == 2
    assert metrics["confidence"] >= 0.70
    assert metrics["polygon"] is not None
    assert metrics["polygon"]["type"] == "Polygon"


def test_inference_pipeline_demo_mode():
    """Verify deterministic demo inference results for all 3 scenarios."""
    # Scenario A: Mumbai High
    res_a = detect_oil_spill(scenario_id="scenario_a", mode="demo")
    assert isinstance(res_a, SpillDetectionResult)
    assert res_a.mode == "demo"
    assert res_a.confidence == pytest.approx(0.942, rel=1e-3)
    assert res_a.area_sqkm == pytest.approx(14.85, rel=1e-3)
    assert res_a.original_image.startswith("data:image/png;base64,")
    assert res_a.mask_image.startswith("data:image/png;base64,")
    assert res_a.overlay_image.startswith("data:image/png;base64,")
    assert "DEMO MODE" in res_a.model_name

    # Scenario B: Goa Corridor
    res_b = detect_oil_spill(scenario_id="scenario_b", mode="demo")
    assert res_b.confidence == pytest.approx(0.860, rel=1e-3)
    assert res_b.area_sqkm == pytest.approx(8.40, rel=1e-3)

    # Scenario C: Gulf of Khambhat
    res_c = detect_oil_spill(scenario_id="scenario_c", mode="demo")
    assert res_c.confidence == pytest.approx(0.580, rel=1e-3)
    assert res_c.area_sqkm == pytest.approx(4.20, rel=1e-3)


def test_inference_pipeline_trained_mode_missing_weights():
    """Verify that trained mode explicitly throws FileNotFoundError when weights are missing."""
    with pytest.raises(FileNotFoundError) as exc_info:
        detect_oil_spill(
            image=np.zeros((128, 128), dtype=np.float32),
            mode="trained",
        )
    assert "Trained model checkpoint not found" in str(exc_info.value)
