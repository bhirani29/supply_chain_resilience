from mesa import Model
from mesa.time import RandomActivation
from agents import SupplierAgent, RetailerAgent

class SupplyChainModel(Model):
    def __init__(self, num_suppliers=3, num_retailers=2):
        self.num_suppliers = num_suppliers
        self.num_retailers = num_retailers
        self.schedule = RandomActivation(self)
        self.messages = []
        self.data = []

        for i in range(num_suppliers):
            supplier = SupplierAgent(f"S{i}", self)
            self.schedule.add(supplier)
        for i in range(num_retailers):
            retailer = RetailerAgent(f"R{i}", self)
            self.schedule.add(retailer)

    def log_data(self, agent_id, metric, value):
        self.data.append({"agent_id": agent_id, "metric": metric, "value": value})

    def step(self):
        self.messages = []
        self.schedule.step()