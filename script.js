// Star Tunnel Effect Controller
class StarTunnelController {
    constructor() {
        this.canvas = document.getElementById('starfield');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 800;
        this.isHyperspace = false;
        this.centerX = 0;
        this.centerY = 0;

        this.button = document.getElementById('hyperspace-btn');
        this.buttonText = this.button.querySelector('.button-text');
        this.statusText = document.getElementById('status-text');

        this.init();
    }

    init() {
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize stars
        this.createStars();

        // Start animation loop
        this.animate();

        // Add button click event
        this.button.addEventListener('click', () => this.toggleHyperspace());

        // Add keyboard shortcut (Space bar)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.toggleHyperspace();
            }
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(this.createStar());
        }
    }

    createStar() {
        // Create star at random angle from center
        const angle = Math.random() * Math.PI * 2;
        // Safe zone: stars must be at least this far from center (creates tunnel effect)
        const minDistance = 300; // Safe zone radius
        const maxDistance = 2500;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);

        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            z: Math.random() * 2000,
            size: Math.random() * 2 + 0.5,
            color: this.getStarColor()
        };
    }

    getStarColor() {
        const colors = [
            { r: 255, g: 255, b: 255 }, // white
            { r: 255, g: 255, b: 255 }, // white (more common)
            { r: 255, g: 255, b: 255 }, // white (more common)
            { r: 136, g: 204, b: 255 }, // blue
            { r: 255, g: 204, b: 136 }, // orange
            { r: 255, g: 220, b: 200 }  // warm white
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateStar(star) {
        // Normal speed: slow travel through space
        // Hyperspace: much faster
        const speed = this.isHyperspace ? 50 : 2;

        // Move star toward camera (decrease z)
        star.z -= speed;

        // Calculate 3D to 2D projection to check if off-screen
        const fov = 300;
        const scale = fov / (fov + star.z);
        const x2d = this.centerX + star.x * scale;
        const y2d = this.centerY + star.y * scale;

        // Reset star ONLY if it goes off-screen (not when z=0)
        const margin = 100;
        if (x2d < -margin || x2d > this.canvas.width + margin ||
            y2d < -margin || y2d > this.canvas.height + margin) {
            const angle = Math.random() * Math.PI * 2;
            // Maintain safe zone when resetting
            const minDistance = 300;
            const maxDistance = 2500;
            const distance = minDistance + Math.random() * (maxDistance - minDistance);
            star.x = Math.cos(angle) * distance;
            star.y = Math.sin(angle) * distance;
            star.z = 1500 + Math.random() * 500; // Start farther back
        }
    }

    drawStar(star) {
        // Calculate 3D to 2D projection
        const fov = 300;
        const scale = fov / (fov + star.z);
        const x2d = this.centerX + star.x * scale;
        const y2d = this.centerY + star.y * scale;

        // Calculate star size based on depth (closer = bigger)
        const size = star.size * scale * 2;

        // Calculate brightness based on depth
        const brightness = Math.min(1, (2000 - star.z) / 2000);

        // Draw the star
        this.ctx.beginPath();

        if (this.isHyperspace) {
            // In hyperspace, draw streaks
            const prevZ = star.z + 50;
            const prevScale = fov / (fov + prevZ);
            const prevX = this.centerX + star.x * prevScale;
            const prevY = this.centerY + star.y * prevScale;

            const gradient = this.ctx.createLinearGradient(prevX, prevY, x2d, y2d);
            gradient.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);
            gradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${brightness})`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = size;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(x2d, y2d);
            this.ctx.stroke();
        } else {
            // Normal mode: draw as dots with glow
            const opacity = brightness * 0.9;

            // Glow effect
            const gradient = this.ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2);
            gradient.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw all stars
        // Sort stars by z-depth (far to near) for proper layering
        this.stars.sort((a, b) => b.z - a.z);

        for (let star of this.stars) {
            this.updateStar(star);
            this.drawStar(star);
        }

        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }

    toggleHyperspace() {
        this.isHyperspace = !this.isHyperspace;

        if (this.isHyperspace) {
            this.engageHyperspace();
        } else {
            this.disengageHyperspace();
        }
    }

    engageHyperspace() {
        // Add hyperspace class to body
        document.body.classList.add('hyperspace');

        // Update button text
        this.buttonText.textContent = 'DISENGAGE';

        // Update status
        this.statusText.textContent = 'HYPERSPACE ACTIVE!';

        // Create flash effect
        this.createFlashEffect('rgba(255, 255, 255, 0.8)');
    }

    disengageHyperspace() {
        // Remove hyperspace class from body
        document.body.classList.remove('hyperspace');

        // Update button text
        this.buttonText.textContent = 'HYPERSPACE';

        // Update status
        this.statusText.textContent = 'CRUISING SPEED';

        // Create exit flash effect
        this.createFlashEffect('rgba(100, 150, 255, 0.5)');
    }

    createFlashEffect(color) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            z-index: 9999;
            pointer-events: none;
            animation: flash 0.6s ease-out forwards;
        `;

        // Add flash animation if it doesn't exist
        if (!document.getElementById('flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
            style.textContent = `
                @keyframes flash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(flash);

        setTimeout(() => {
            flash.remove();
        }, 600);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StarTunnelController();

    // Console message
    console.log('%c🚀 Holocron Systems Online',
        'color: #FFE81F; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #FFE81F;');
    console.log('%cPress SPACE to toggle hyperspace!',
        'color: #00D4FF; font-size: 14px;');
});
