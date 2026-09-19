"""PyTorch U-Net Architecture for Oil Spill Segmentation in Sentinel-1 SAR Imagery."""

import os
from typing import Optional, Dict, Any

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


if TORCH_AVAILABLE:
    class DoubleConv(nn.Module):
        """(Convolution => [BatchNorm] => ReLU) * 2"""
        def __init__(self, in_channels: int, out_channels: int):
            super().__init__()
            self.double_conv = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.double_conv(x)

    class UNet(nn.Module):
        """Standard U-Net encoder-decoder architecture for binary oil slick segmentation.
        
        Takes single-channel calibrated SAR backscatter input (Sentinel-1 VV or VH polarization)
        and outputs a single-channel spatial probability map of hydrocarbon slicks.
        """
        def __init__(self, n_channels: int = 1, n_classes: int = 1, bilinear: bool = False):
            super().__init__()
            self.n_channels = n_channels
            self.n_classes = n_classes
            self.bilinear = bilinear

            self.inc = DoubleConv(n_channels, 32)
            self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
            self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
            self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))

            factor = 2 if bilinear else 1
            self.down4 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(256, 512 // factor))

            if bilinear:
                self.up1 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
                self.up2 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
                self.up3 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
                self.up4 = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
            else:
                self.up1 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
                self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
                self.up3 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
                self.up4 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)

            self.conv_up1 = DoubleConv(512, 256)
            self.conv_up2 = DoubleConv(256, 128)
            self.conv_up3 = DoubleConv(128, 64)
            self.conv_up4 = DoubleConv(64, 32)

            self.outc = nn.Conv2d(32, n_classes, kernel_size=1)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            x1 = self.inc(x)
            x2 = self.down1(x1)
            x3 = self.down2(x2)
            x4 = self.down3(x3)
            x5 = self.down4(x4)

            x = self.up1(x5)
            x = self.conv_up1(torch.cat([x, x4], dim=1))

            x = self.up2(x)
            x = self.conv_up2(torch.cat([x, x3], dim=1))

            x = self.up3(x)
            x = self.conv_up3(torch.cat([x, x2], dim=1))

            x = self.up4(x)
            x = self.conv_up4(torch.cat([x, x1], dim=1))

            logits = self.outc(x)
            return self.sigmoid(logits)

        def load_weights(self, checkpoint_path: str, map_location: str = "cpu") -> None:
            """Load trained weights from a state dict checkpoint."""
            if not os.path.exists(checkpoint_path):
                raise FileNotFoundError(f"Model checkpoint not found at: {checkpoint_path}")
            state_dict = torch.load(checkpoint_path, map_location=map_location)
            if "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]
            self.load_state_dict(state_dict)

else:
    class UNet:
        """Fallback stub when PyTorch is not available."""
        def __init__(self, *args, **kwargs):
            pass

        def load_weights(self, checkpoint_path: str) -> None:
            raise RuntimeError("PyTorch is required to load model weights.")
