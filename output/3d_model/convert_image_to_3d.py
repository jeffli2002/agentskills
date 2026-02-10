#!/usr/bin/env python3
"""
Image to 3D conversion pipeline for anime portrait.
Uses trimesh instead of open3d for mesh generation.
"""

import sys
import numpy as np
from PIL import Image
import cv2
import matplotlib.pyplot as plt
from scipy import ndimage
from scipy.spatial import Delaunay

# Input/output paths
INPUT_IMAGE = r"D:\HuaweiMoveData\Users\jeffl\xwechat_files\jeffli2002_b1bc\temp\RWTemp\2026-01\cc7b38debe7a73468deac35c7000dd9e\94c8d06cd732a10afab3cc88ee1f3c20.jpg"
OUTPUT_DIR = r"D:\AI\agentskills\output\3d_model"

def estimate_depth(image_path):
    """Estimate depth using HuggingFace transformers pipeline."""
    from transformers import pipeline

    print("  - Loading Intel/dpt-hybrid-midas depth estimation model...")
    depth_estimator = pipeline("depth-estimation", model="Intel/dpt-hybrid-midas")

    print("  - Processing image...")
    image = Image.open(image_path)
    predictions = depth_estimator(image)
    depth_map = predictions["depth"]

    # Convert to numpy and normalize
    depth_array = np.array(depth_map)
    depth_normalized = (depth_array - depth_array.min()) / (depth_array.max() - depth_array.min())

    return depth_normalized, np.array(image)

def create_mesh_from_depth(depth_map, rgb_image, scale_factor=1.5, downsample=4):
    """Create a 3D mesh from depth map using Delaunay triangulation."""
    import trimesh

    # Downsample for manageable mesh size
    h, w = depth_map.shape
    new_h, new_w = h // downsample, w // downsample

    depth_small = cv2.resize(depth_map, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    rgb_small = cv2.resize(rgb_image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    print(f"  - Creating mesh from {new_w}x{new_h} depth map...")

    # Create coordinate grids
    x = np.linspace(-1, 1, new_w) * scale_factor
    y = np.linspace(-1, 1, new_h) * scale_factor
    xv, yv = np.meshgrid(x, y)

    # Flip y for proper orientation
    yv = -yv

    # Use depth as Z coordinate
    zv = depth_small * scale_factor * 0.5  # Scale depth

    # Create vertices
    vertices = np.stack([xv.flatten(), yv.flatten(), zv.flatten()], axis=1)

    # Create vertex colors (normalize to 0-1)
    colors = rgb_small.reshape(-1, 3) / 255.0
    # Add alpha channel
    colors = np.hstack([colors, np.ones((len(colors), 1))])

    # Create faces using grid connectivity
    faces = []
    for i in range(new_h - 1):
        for j in range(new_w - 1):
            idx = i * new_w + j
            # Two triangles per grid cell
            faces.append([idx, idx + 1, idx + new_w])
            faces.append([idx + 1, idx + new_w + 1, idx + new_w])

    faces = np.array(faces)
    print(f"  - Generated {len(vertices):,} vertices and {len(faces):,} faces")

    # Create trimesh object
    mesh = trimesh.Trimesh(
        vertices=vertices,
        faces=faces,
        vertex_colors=colors
    )

    return mesh

def save_depth_visualization(depth_map, output_path):
    """Save colorized depth map visualization."""
    plt.figure(figsize=(10, 10))
    plt.imshow(depth_map, cmap='plasma')
    plt.colorbar(label='Depth (normalized)', shrink=0.8)
    plt.title('Depth Map Estimation')
    plt.axis('off')
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()

def main():
    import trimesh

    print("=" * 60)
    print("IMAGE TO 3D CONVERSION PIPELINE")
    print("=" * 60)

    # Step 1: Analyze input image
    print("\n[Step 1/5] Analyzing input image...")
    image = Image.open(INPUT_IMAGE)
    print(f"  - Image size: {image.size}")
    print(f"  - Image mode: {image.mode}")

    # Step 2: Depth estimation
    print("\n[Step 2/5] Performing depth estimation...")
    depth_normalized, rgb_array = estimate_depth(INPUT_IMAGE)
    print(f"  - Depth map size: {depth_normalized.shape}")

    # Save depth map
    depth_img = (depth_normalized * 255).astype(np.uint8)
    cv2.imwrite(f"{OUTPUT_DIR}/depth_map.png", depth_img)
    np.save(f"{OUTPUT_DIR}/depth_map.npy", depth_normalized)
    print(f"  - Depth map saved to: {OUTPUT_DIR}/depth_map.png")

    # Visualize depth
    save_depth_visualization(depth_normalized, f"{OUTPUT_DIR}/depth_visualization.png")
    print(f"  - Depth visualization saved to: {OUTPUT_DIR}/depth_visualization.png")

    # Step 3: Generate 3D mesh
    print("\n[Step 3/5] Generating 3D mesh from depth...")
    mesh = create_mesh_from_depth(depth_normalized, rgb_array, scale_factor=2.0, downsample=2)

    # Step 4: Smooth and optimize mesh
    print("\n[Step 4/5] Optimizing mesh...")
    # Apply Laplacian smoothing
    mesh = trimesh.smoothing.filter_laplacian(mesh, iterations=2)
    print(f"  - Smoothed mesh has {len(mesh.vertices):,} vertices and {len(mesh.faces):,} faces")

    # Step 5: Export 3D model
    print("\n[Step 5/5] Exporting 3D model...")

    # Export as OBJ
    obj_path = f"{OUTPUT_DIR}/anime_portrait.obj"
    mesh.export(obj_path)
    print(f"  - OBJ model saved to: {obj_path}")

    # Export as PLY (preserves vertex colors)
    ply_path = f"{OUTPUT_DIR}/anime_portrait.ply"
    mesh.export(ply_path)
    print(f"  - PLY model saved to: {ply_path}")

    # Export as GLB (for web/AR)
    glb_path = f"{OUTPUT_DIR}/anime_portrait.glb"
    mesh.export(glb_path)
    print(f"  - GLB model saved to: {glb_path}")

    # Export as STL (for 3D printing)
    stl_path = f"{OUTPUT_DIR}/anime_portrait.stl"
    mesh.export(stl_path)
    print(f"  - STL model saved to: {stl_path}")

    print("\n" + "=" * 60)
    print("CONVERSION COMPLETE!")
    print("=" * 60)
    print(f"\nOutput files in: {OUTPUT_DIR}")
    print("  - depth_map.png        (grayscale depth map)")
    print("  - depth_map.npy        (depth data as numpy array)")
    print("  - depth_visualization.png (colorized depth)")
    print("  - anime_portrait.obj   (3D model - Wavefront OBJ)")
    print("  - anime_portrait.ply   (3D model with vertex colors)")
    print("  - anime_portrait.glb   (3D model for web/AR)")
    print("  - anime_portrait.stl   (3D model for 3D printing)")

if __name__ == "__main__":
    main()
