import matplotlib.pyplot as plt
import numpy as np

# Define beta (v/c) for the moving frame S'
beta = 0.6

# Create a figure and axis with equal aspect ratio
fig, ax = plt.subplots(figsize=(8, 8))
ax.set_xlim(-4, 4)
ax.set_ylim(-4, 4)
ax.set_aspect('equal', adjustable='box')

# --- Draw the stationary frame S axes ---
# Draw x-axis (horizontal) and ct-axis (vertical)
ax.axhline(0, color='black', linewidth=1)
ax.axvline(0, color='black', linewidth=1)

# Add arrowheads to the axes
ax.annotate("", xy=(4, 0), xytext=(0, 0), arrowprops=dict(arrowstyle="->", color='black'))
ax.annotate("", xy=(0, 4), xytext=(0, 0), arrowprops=dict(arrowstyle="->", color='black'))

# --- Draw the light cone ---
# Light rays: ct = ± x (diagonals at 45°)
x_vals = np.linspace(-4, 4, 100)
ax.plot(x_vals, x_vals, 'r--', label='ct = x')
ax.plot(x_vals, -x_vals, 'r--', label='ct = -x')

# --- Draw the moving frame S' axes ---
# S' time axis (ct'): This is the worldline of the moving observer: x = beta * ct.
ct_vals = np.linspace(-4, 4, 100)
x_ctprime = beta * ct_vals
ax.plot(x_ctprime, ct_vals, 'b-', linewidth=2, label="ct' axis")

# S' space axis (x'): Defined by the set of events that are simultaneous in S', i.e. ct = beta * x.
x_vals = np.linspace(-4, 4, 100)
ct_xprime = beta * x_vals
ax.plot(x_vals, ct_xprime, 'b-', linewidth=2, label="x' axis")

# --- Annotate the diagram ---
# Label the stationary frame axes
ax.text(4.1, 0, '$x$', fontsize=12, ha='left', va='center')
ax.text(0, 4.1, '$ct$', fontsize=12, ha='center', va='bottom')

# Label the moving frame axes (placing labels near the ends)
ax.text(2.5, 4, "$ct'$", color='blue', fontsize=12, ha='left', va='bottom')
ax.text(4, 2.5, "$x'$", color='blue', fontsize=12, ha='right', va='top')

# Add title and legend
ax.set_title("Minkowski Diagram for Special Relativity\nStationary Frame S and Moving Frame S' (v/c = {})".format(beta))
ax.legend(loc='upper left')

# Optionally, add grid lines for better readability
ax.grid(True, which='both', linestyle='--', linewidth=0.5)

# Display the diagram
plt.show()
