"""PyTorch U-Net Architecture for Oil Slick Segmentation in Sentinel-1 SAR Imagery."""

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


if TORCH_AVAILABLE:
    class DoubleConv(nn.Module):
        """(Convolution => [BN] => ReLU) * 2"""
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

        def forward(self, x):
            return self.double_conv(x)

    class UNetSpillDetector(nn.Module):
        """Standard U-Net encoder-decoder for binary oil slick segmentation."""
        def __init__(self, n_channels: int = 1, n_classes: int = 1):
            super().__init__()
            self.n_channels = n_channels
            self.n_classes = n_classes

            self.inc = DoubleConv(n_channels, 32)
            self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
            self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
            self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))

            self.up1 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
            self.conv_up1 = DoubleConv(256, 128)

            self.up2 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
            self.conv_up2 = DoubleConv(128, 64)

            self.up3 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
            self.conv_up3 = DoubleConv(64, 32)

            self.outc = nn.Conv2d(32, n_classes, kernel_size=1)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x):
            x1 = self.inc(x)
            x2 = self.down1(x1)
            x3 = self.down2(x2)
            x4 = self.down3(x3)

            x = self.up1(x4)
            x = self.conv_up1(torch.cat([x, x3], dim=1))
            x = self.up2(x)
            x = self.conv_up2(torch.cat([x, x2], dim=1))
            x = self.up3(x)
            x = self.conv_up3(torch.cat([x, x1], dim=1))

            logits = self.outc(x)
            return self.sigmoid(logits)

else:
    class UNetSpillDetector:
        """Stub when PyTorch is not yet installed."""
        def __init__(self, *args, **kwargs):
            pass
