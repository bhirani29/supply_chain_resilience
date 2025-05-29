from mesa import Agent
import numpy as np

class SupplierAgent(Agent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.inventory = 100

    def step(self):
        self.inventory -= np.random.randint(5, 10)
        if self.inventory < 20:
            self.send_message({"type": "low_inventory", "stock": self.inventory})
        if np.random.random() < 0.1:  # 10% chance of restocking
            self.inventory += 50
        self.model.log_data(self.unique_id, "inventory", self.inventory)

    def send_message(self, message):
        message["agent_id"] = self.unique_id
        self.model.messages.append(message)

class RetailerAgent(Agent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.stock = 50
        self.demand = 10

    def step(self):
        self.stock -= self.demand
        if self.stock < 10:
            self.send_message({"type": "order", "quantity": 50})
        self.model.log_data(self.unique_id, "stock", self.stock)

    def send_message(self, message):
        message["agent_id"] = self.unique_id
        self.model.messages.append(message)